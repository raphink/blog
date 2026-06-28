---
template: post
title: "From openvz to VMWare"
date: "2012-03-14T10:57:00.000+01:00"
canonical_url: "https://raphink.blogspot.com/2012/03/from-openvz-to-vmware.html"
blogspot_url: "https://raphink.blogspot.com/2012/03/from-openvz-to-vmware.html"
tags: ["debian", "sysadmin", "ubuntu", "virtualization"]
---
I was recently asked to convert an openvz container to a VMWare instance. I found a [tutorial on a forum](http://communities.vmware.com/message/1719787#1719787) which helped but had to be adapted slightly.  
  
Here is how I eventually managed to do the conversion:  

1.  On the openvz host, create an image (in my case, I need 20GB):  
    ```bash
    dd if=/dev/zero of=test.img bs=516096c count=40000
    ```
2.  Create a partition table in the image:  
    ```bash
    fdisk test.img
    ```
    Type:
    ```text
    o
    n
    p
    1
    2048
    w
    ```
3.  Mount the image using the offset corresponding to the partition table (in our case, 2048\*512=1048576):  
    ```bash
    losetup -o1048576 /dev/loop0 test.img
    mke2fs -b1024 /dev/loop0
    tune2fs -j /dev/loop0
    mount /dev/loop0 /mnt
    ```
4.  Retrieve the UUID of the partition. Note it somewhere, you will need it several times:  
    ```bash
    blkid /dev/loop0
    ```
5.  Copy the container files to the image. I used rsync to exclude some data that were too big. Make sure to use `--numeric-ids` to prevent bad mapping of UIDs:  
    ```bash
    rsync -av --exclude 'somedir' --numeric-ids /vz/root/1234/ /mnt
    ```
6.  Install grub on the disk:  
    ```bash
    grub-install --root-directory /mnt /dev/loop0
    ```
7.  Chroot into the mounted partition:  
    ```bash
    chroot /mnt
    ```
8.  Install a kernel and grub (using apt for example):  
    ```bash
    apt-get install linux-image-foobar #adapt to your kernel version
    apt-get install grub-pc
    ```
9.  Give a password to root:  
    ```bash
    passwd
    ```
10.  Change inittab to add the ttys:  
     ```text
     1:2345:respawn:/sbin/getty 38400 tty1
     2:23:respawn:/sbin/getty 38400 tty2
     3:23:respawn:/sbin/getty 38400 tty3
     4:23:respawn:/sbin/getty 38400 tty4
     5:23:respawn:/sbin/getty 38400 tty5
     6:23:respawn:/sbin/getty 38400 tty6
     ```
11.  Create an /etc/fstab file (change the UUID with yours):  
     ```fstab
     proc /proc proc nodev,noexec,nosuid 0 0
     UUID=7925e5b1-f2ad-4cdc-95f9-984d25378194 / ext4 errors=remount-ro 0 1
     ```
12.  Umount the image and convert it to a vmdk image:  
     ```bash
     umount /mnt
     kvm-img convert -f raw test.img -O vmdk test.vmdk
     ```
13.  Boot the machine on the virtual disk with VMWare or Virtualbox. You should get a grub prompt (adapt with your UUID). In grub2, you can use autocompletion for the Linux kernel and the initrd image:  
     ```text
     grub> insmod ext2
     grub> set root='(hd0,msdos1)'
     grub> linux /boot/vmlinuz-foobar root=UUID=7925e5b1-f2ad-4cdc-95f9-984d25378194 ro
     grub> initrd /boot/initrd-foobar
     grub> boot
     ```
14.  Log in to the machine and run `update-grub`
15.  Adapt your network settings
