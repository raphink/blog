---
template: post
title: "Bitten by HA: PuppetDB & PostgreSQL"
date: "2020-05-22T14:32:17Z"
excerpt: "When PuppetDB started misbehaving, it took us quite a while to realize the problem was somewhere else…"
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fux2ltllgi7mjem72mf2z.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fux2ltllgi7mjem72mf2z.png"
canonical_url: "https://dev.to/camptocamp-ops/bitten-by-ha-puppetdb-postgresql-1eld"
devto_url: "https://dev.to/camptocamp-ops/bitten-by-ha-puppetdb-postgresql-1eld"
---
Last Wednesday morning, a colleague informed me that our internal Puppet infrastructure was performing slowly. Looking at the Puppetboard, I quickly realized there was another issue: all the nodes were marked as unreported, with the last report dating from more than 24 hours in the past.

I checked the PuppetDB logs and saw that the reports were coming fine and being saved, so something else was wrong.

## PuppetDB Upgrade

After a few hours of debugging, I still had no clue so I resorted to the option of upgrading the PuppetDB. I ideally wanted to stay with PuppetDB 5.x to avoid a major upgrade, but there was no available official Docker image for PuppetDB 5.x above 5.2.7 (which we are using).

So I upgraded to PuppetDB 6.9.1 and then PuppetDB 6.10.1.


## PostgreSQL SSL

At first, the connection with PostgreSQL failed as PuppetDB now defaults to fully verifying the PostgreSQL SSL certificate against the Puppet CA. So I had to modify the PostgreSQL connection string to include `?sslmode=require` and restart the PuppetDB.


## Jolokia Authorization

The logs seemed fine at first, but the Puppetboard kept returning an error 500. That's when I realized that PuppetDB now required an access file to allow hosts by IP range. I modified our Helm chart to include [a new configuration file](https://github.com/voxpupuli/puppetboard/issues/566#issuecomment-622234110), but Puppetboard still wasn't happy.


## JDBC errors

I restarted the PuppetDB and started seeing weird log lines looping infinitely, right after the migration step in startup:

```logs
2020-05-20 18:55:40,169 WARN  [clojure-agent-send-off-pool-1] [p.p.jdbc] Caught exception. Last attempt, throwing exception.
```

At this point, [Charlie Sharpsteen](https://twitter.com/csharpsteen) started helping me to debug the issue.

I tried manual `curl` requests to the PuppetDB and the logs started sprouting stack traces mentioning both JDBC connection issues as well as the database schema version being wrong:

```logs
...
Caused by: java.sql.SQLTransientConnectionException: PDBReadPool - Connection is not available, request timed out after 3000ms.
...
Caused by: com.zaxxer.hikari.pool.PoolBase$ConnectionSetupException: org.postgresql.util.PSQLException: ERROR: Please run PuppetDB with the migrate option set to true
                 to upgrade your database. The detected migration level 66 is
                 out of date.
...
```

I connected to the PostgreSQL database and checked it. Everything looked fine, and `select max(version) from schema_migrations;` returned `74` as expected, not `66`. So where did this number come from? Charlie started suspecting that there was another database involved…

Totally out of other options, I decided to remove the lines with versions above 66 in the `schema_migrations` table and see if restarting the PuppetDB would finalize the migration. That was a huge failure, as the migration scripts are not idempotent, as could be expected.

I was left with only one option: dropping the database and restoring it.
But then PostgreSQL refused to drop the database, saying it was read-only. I tried forcing read-write, but the database was marked in recovery.

That's when I gave up for the day (as it was already past 23:00). I turned off the PuppetDB service entirely (scaled the deployment to 0 replicas actually) and went to bed, letting the nodes apply catalogs from cache for the next 30 hours (since Thursday was off).


## DNS Issue

This morning, we got back to debugging this problem, and things started making more sense.

First off, it turned out I was trying to drop the database on a slave cluster. I had ended up on the slave by using a production CNAME DNS entry which pointed to both the master and slave in round-robin…

Once my colleague [Julien](https://github.com/Vampouille) had helped me realize that, he was able to drop the database on the master. We restarted the PuppetDB in version 6.10.1. But the errors were still there…

## The Data is still there

We rolled back to PuppetDB 5.2.7 and a clean database… Everything started fine, but the Puppetboard still showed all nodes as unreported! Where could it get these nodes if the database had been wiped‽

This led us to the conclusion that the data was still somewhere else… on the slave…


# The problem

So here's what happened.

## The root cause

Earlier this week, there was an outage with the object storage facility we're using for wal-g, our PostgreSQL backup tool.

![PostgreSQL cluster losing synchronization](https://dev-to-uploads.s3.amazonaws.com/i/ux2ltllgi7mjem72mf2z.png)

This led to a disk full on our master PostgreSQL machine. The disk full was very short as PostgreSQL restarted and removed all its WALs so it went unnoticed. However, this also broke replication, so the slave PostgreSQL database ended up stuck on that date. For some reason, we missed the replication alert.

![Wal segments lost](https://dev-to-uploads.s3.amazonaws.com/i/ayytz0tufaf6mrh83q29.png)


## The PuppetDB symptoms

PuppetDB is configured to write to master and read from slave. This is why all our nodes were unreported in Puppetboard (since they came from slave), even though PuppetDB kept writing the reports properly (in master)! This also explains the weird errors after upgrading to PuppetDB 6, since migration was properly done on the master (to schema v74) but read requests went to the slave (stuck in schema v66).


# The solution

Since we had wiped the master's database this morning, we ended up restoring from the slave's version, and going back to PuppetDB 5.2.7 until we can properly solve the Jolokia potential issues with external access to the PuppetDB API.

All nodes in Puppetboard have now returned to normal.
