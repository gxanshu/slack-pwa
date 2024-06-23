# Slack PWA

Convert Slack web version into installable PWA. (inspired from [slack-window](https://github.com/nemke82/slack-window))

## Why

It all starts with a tweet.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Please <a href="https://twitter.com/SlackHQ?ref_src=twsrc%5Etfw">@SlackHQ</a> add PWA, your electron based Deb app sucks.</p>&mdash; Anshu M (@gxanshu) <a href="https://twitter.com/gxanshu/status/1795782877717856299?ref_src=twsrc%5Etfw">May 29, 2024</a></blockquote>

Honestly i hate electron based applications, even if you are running any chromium based browser like Brave or any other browser it still loads its own chromium thread, takes more RAM and decrease performance. i personally believe still so far PWA is the best way to install web apps as desktop applications.

## How to install

> Note you will need chromium based browser to install this

1. Download the slack-pwa.zip file from [release](https://github.com/gxanshu/slack-pwa/releases/tag/release) page.
2. Extract it some where
3. Open your browser. go to menu (the three lines)
4. Click on Extensions
5. Click the **Developer mode** checkbox and then click the button labeled **Load unpacked extension…**
6. Choose extract folder & load
7. Open slack web version. hard reload it (**CTRL + SHIFT + R**)
8. if still not works then clear all the cache & cookies of slack and login again.
9. you will see install PWA button. just install and ready to go
