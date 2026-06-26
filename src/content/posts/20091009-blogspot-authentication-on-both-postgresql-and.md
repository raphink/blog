---
template: post
title: "Authentication on both PostgreSQL and LDAP in Gforge"
date: "2009-10-09T11:57:00.000+02:00"
canonical_url: "https://raphink.blogspot.com/2009/10/authentication-on-both-postgresql-and.html"
blogspot_url: "https://raphink.blogspot.com/2009/10/authentication-on-both-postgresql-and.html"
tags: ["debian", "gforge", "ldap", "nss", "postgresql", "sysadmin", "ubuntu"]
---
I am currently working on migrating a Gforge platform from authenticating on the local PostgreSQL to a centralized LDAP server.  
  
Apart from setting up PAM-LDAP (Martin Owens can tell you [all about the mess it is](http://doctormo.wordpress.com/2009/10/08/ldap-pam-users/)), the fun thing was to have some users authenticate on PostgreSQL and others on LDAP during the time of the migration.  
  
Using a modified version of the LDAP plugin for Gforge, users are prompted for their LDAP login and password when they log in, and we fill a _plugin\_ldapextauth\_users_ table with the Gforge IDs of the migrated users. Then comes the fun part. Users that are not yet migrated have to be able to log in using their Gforge login, but not their LDAP login. Users that are migrated have to be able to use their LDAP login, but their Gforge login should fail.  
  
Note: This post is not a tutorial on how to set up libnss-pgsql2 or libnss-ldap. I won't be explaining these.  
  
This is the solution I've come to. The machines are running on Debian Etch.  
  

## In /etc/nsswitch.conf

  

  
passwd: compat pgsql ldap  
group:  compat pgsql ldap  
shadow: compat pgsql ldap  

  
  
PostgreSQL is tried before ldap, but must fail when the user has been migrated.  
  
  

## In /etc/nss-pgsql.conf and /etc/nss-pgsql-root.conf

  

  
#getpwnam        = SELECT login AS username,passwd,gecos,('/var/lib/gforge/chroot/home/users/' || login) AS homedir,shell,uid,gid FROM nss\_passwd WHERE login = $1  
getpwnam        = SELECT nss.login AS username,nss.passwd,nss.gecos,('/var/lib/gforge/chroot/home/users/' || login) AS homedir,nss.shell,nss.uid,nss.gid FROM nss\_passwd nss JOIN users ON users.user\_name=nss.login LEFT JOIN plugin\_ldapextauth\_users ldap ON users.user\_id=ldap.user\_id WHERE ldap.user\_id IS NULL AND login = $1;  

  
  

  
#shadowbyname    = SELECT login AS shadow\_name, passwd AS shadow\_passwd, 14087 AS shadow\_lstchg, 0 AS shadow\_min, 99999 AS shadow\_max, 7 AS shadow\_warn, '' AS shadow\_inact, '' AS shadow\_expire, '' AS shadow\_flag FROM nss\_passwd WHERE login = $1 AND ldap = 0  
shadowbyname     = SELECT nss.login AS shadow\_name,nss.passwd AS shadow\_passwd,14087 AS shadow\_lstchg, 0 AS shadow\_min, 99999 AS shadow\_max, 7AS shadow\_warn, '' AS shadow\_inact, '' AS shadow\_expire, '' AS shadow\_flag FROM nss\_passwd nss JOIN users ON users.user\_name=nss.login LEFT JOIN plugin\_ldapextauth\_users ldap ON users.user\_id=ldap.user\_id WHERE ldap.user\_id IS NULL AND login = $1;  

  
  
This requires to GRANT SELECT access to tables _users_ and _plugin\_ldapextauth\_users_ to user _gforge\_nss_. As a result, the request fails if the user id is found in the _plugin\_ldapextauth\_users_ table, so it goes to try LDAP instead.  
  
  

## In /etc/pam.d/common-auth

  

  
\# pam\_unix fails permanently when users are migrated  
auth sufficient pam\_unix.so nullok\_secure  
\# Filter accounts that are not migrated  
\# Since pam\_unix fails for migrated accounts,  
\#  uid then comes from ldap  
auth required   pam\_succeed\_if.so uid > 60000  
\# Note: try\_first\_pass will prompt for LDAP password  
\#  if provided password failed  
auth required   pam\_ldap.so try\_first\_pass  

  
  
This is the only thing I needed to modify in /etc/pam.d. Gforge accounts use the 20xxx uid range, while our LDAP uses 60xxx, hence the pam\_succeed\_if.so condition to filter LDAP accounts only. This works because the uid that is returned by "getent passwd $user" corresponds to the one in the LDAP when a user is migrated, since the PostgreSQL query fails in that case (see /etc/nss-pgsql\*.conf).  
  
  

## Chowning homes

  
  
When migrating users, uids change, and sometimes even login names. I've chosen to use inotify (incron) to fix that issue. When a user is migrated in the web interface, it drops a file in /var/lib/gforge/ldap\_users named after the Gforge user name, which contains the LDAP user name.  
  
Incron watches /var/lib/gforge/ldap\_users with the following conf:  
/var/lib/gforge/ldap\_users IN\_CREATE /usr/lib/gforge-dop-pamldap/chown\_home.sh $# $@  
  
The chown\_home.sh script then achieves the following tasks:  

  
-   Symlink the new home directory (/home/$ldap\_user) to the old one (/var/lib/gforge/chroot/home/users/$gforge\_user)
  
-   Chown the directory with the new user (chown $ldap\_user. $home)
  

  
  
  

## Remaining issues

  
  
The main remaining issue is groups. The Gforge database uses the login to map users to groups, instead of the Gforge id, so when the Gforge login is different from the LDAP login, migrated users currently lose their groups. The easiest option is probably to change all occurrences of the login with the LDAP login in all group tables, but it's a bit violent...
