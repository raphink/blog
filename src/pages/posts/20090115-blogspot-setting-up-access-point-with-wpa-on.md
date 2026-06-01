---
template: post
title: "Setting up an access point with WPA on Ubuntu Intrepid"
date: "2009-01-15T23:00:00.001+01:00"
canonical_url: "https://raphink.blogspot.com/2009/01/setting-up-access-point-with-wpa-on.html"
blogspot_url: "https://raphink.blogspot.com/2009/01/setting-up-access-point-with-wpa-on.html"
tags: ["debian", "documentation", "english", "linux", "network", "open-source", "sysadmin", "ubuntu", "wifi"]
---
This is a quick tutorial inspired by the French tutorial I used from [Léa Linux](http://www.lea-linux.org/cached/index/Cr%C3%83%C2%A9er_un_point_d%27acc%C3%83%C2%A8s_s%C3%83%C2%A9curis%C3%83%C2%A9_avec_hostAPd.html), as I spent two hours configuring an access point on my machine, using WPA authentication with a madwifi card (atheros).  
  
  

## Basic network configuration

  
  
Madwifi needs a network bridge to work. Fortunately for me, the atheros card has its bridge automatically set up when the interface is mounted. The card gets the ath0 interface, while the bridge is labelled wifi0.  
  
With this card, I had to add an autocreate=ap option in modprobe. To do that :  
`    echo "options ath_pci autocreate=ap" | sudo tee /etc/modprobe.d/ath_pci    `  
  
  
Then I set ath0 in /etc/network/interfaces :  
`    $ cat /etc/network/interfaces   auto lo   iface lo inet loopback      auto eth0   iface eth0 inet dhcp      auto ath0   iface ath0 inet static   wireless-mode master   wireless-channel 9   wireless-essid jonah   address 192.168.1.254   netmask 255.255.255.0   broadcast 192.168.1.255    `  
  
  
I get my Internet connection through a router with a DHCP server on eth0.  
  
  
Reload your network after you're done setting it up :  
`    sudo /etc/init.d/networking restart    `  
  
  
  

## Setting up hostapd

  
  
Hostapd allows to set up a nice wifi access point with WPA authentication in a short time. Here is my configuration (ignoring empty and commented lines) :  
`    cat /etc/default/hostapd | grep -v "^\(#\|$\)"   RUN_DAEMON="yes"   DAEMON_CONF="/etc/hostapd/hostapd.conf"      $ sudo cat /etc/hostapd/hostapd.conf | grep -v "^\(#\|$\)"   interface=ath0   bridge=wifi0   driver=madwifi   logger_syslog=-1   logger_syslog_level=2   logger_stdout=-1   logger_stdout_level=2   debug=0   dump_file=/tmp/hostapd.dump   ctrl_interface=/var/run/hostapd   ctrl_interface_group=0   ssid=jonah   hw_mode=g   channel=60   beacon_int=100   dtim_period=2   max_num_sta=255   rts_threshold=2347   fragm_threshold=2346   macaddr_acl=0   auth_algs=3   ignore_broadcast_ssid=0   wme_enabled=1   wme_ac_bk_cwmin=4   wme_ac_bk_cwmax=10   wme_ac_bk_aifs=7   wme_ac_bk_txop_limit=0   wme_ac_bk_acm=0   wme_ac_be_aifs=3   wme_ac_be_cwmin=4   wme_ac_be_cwmax=10   wme_ac_be_txop_limit=0   wme_ac_be_acm=0   wme_ac_vi_aifs=2   wme_ac_vi_cwmin=3   wme_ac_vi_cwmax=4   wme_ac_vi_txop_limit=94   wme_ac_vi_acm=0   wme_ac_vo_aifs=2   wme_ac_vo_cwmin=2   wme_ac_vo_cwmax=3   wme_ac_vo_txop_limit=47   wme_ac_vo_acm=0   eapol_key_index_workaround=0   eap_server=0   own_ip_addr=127.0.0.1   wpa=1   wpa_passphrase=My Great Passphrase for the Access Point   wpa_key_mgmt=WPA-PSK   wpa_pairwise=TKIP   wpa_group_rekey=600   wpa_gmk_rekey=86400    `  
  
Don't forget to change the passphrase (up to 63 characters).  
  
Check your conf with :  
`    sudo hostapd -dd /etc/hostapd/hostapd.conf    `  
  
  
I had problems there at first because my card wasn't able to be set to master mode (ap, see above for the modprobe.d hack). To set your card to master mode without rebooting, reload the driver :  
`    sudo modprobe -r ath_pci   sudo modprobe ath_pci autocreate=ap    `  
  
  
If hostapd works fine, you can launch it in the background :  
`    sudo /etc/init.d/hostapd start    `  
  
Once hostapd is set up, you should be able to connect to your AP by providing a manual IP address (in the right network). But you might want to go further, and set your AP as a DHCP server and router. These next steps are compiled from [a post on Ubuntu Forums](http://ubuntuforums.org/archive/index.php/t-335465.html).  
  
  

## Setting up DHCP and DNS

  
  
The first thing you want is a DHCP server. Since the post on Ubuntu Forums gets us to install dnsmasq to forward the DNS requests, and that dnsmasq can also be used as a DHCP server, I didn't see the use for dhcp3-server, so I deactivated it. Here is my configuration for dnsmasq :  
`    $ sudo cat /etc/default/dnsmasq | grep -v "^\(#\|$\)"   ENABLED=1      $ sudo cat /etc/dnsmasq.conf | grep -v "^\(#\|$\)"   dhcp-range=192.168.1.50,192.168.1.150,12h    `  
  
Pretty easy, no? This will simply forward the DNS requests to the DNS servers listed in /etc/resolv.conf, and provide a very basic DHCP server serving addresses from 192.168.1.50 to 192.168.1.150.  
  
  
We can now restart dnsmasq with :  
`    sudo /etc/init.d/dnsmasq restart    `  
  
  
This step should now let you connect to your AP without setting a static IP (using knetworkmanager for example). But you won't get really far from there, until you set up the NAT.  
  
  

## Setting up the NAT

  
  
This is the last step, setting up the NAT so that your AP can work as a router.  
  
First, add IP forwarding settings to your sysctl.conf (to have it at next reboot) and activate it (for now) :  
`    sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE   echo "net.ipv4.ip_forward = 1" | sudo tee -a /etc/sysctl.conf   echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward"    `  
  
  
Then set ipmasq to start up after services are started. This way, ipmasq will manage your iptables firewall after the interfaces are up and both dnsmasq and hostapd are up :  
`    sudo dpkg-reconfigure dnsmasq    `  
  
  
Warning: if you have static firewall rules, you should add them to the ipmasq settings (see "man ipmasq for more details).  
  
  
Restart your AP host to make sure it still works after a reboot and enjoy.
