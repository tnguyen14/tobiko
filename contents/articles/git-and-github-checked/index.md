---
title: "Git and GitHub: checked!"
author: tri-nguyen
date: 2012-10-01
template: article.hbs
---

Today marks an important milestone in my developer career: I have successfully managed to get started with Git and Github, including creating my first repo and pushed changes to it.

Here's a quick rundown of how I did it (references for my future self).

<span class="more"></span>

## 1. Install git
I downloaded the [Git Mac installer](http://git-scm.com/downloads) and run the install.
**First challenge**: Mac by default uses its own version of git, which is stored in `/usr/bin`, while the git installer install git in a different directory `/usr/local/bin/git/bin`.

#### Note

- You can check out which version your Mac is using by typing this into Terminal `git --version` and `which git`.

I couldn't really figure out how to change this to make it work. So what I ended up doing was delete the default `git` file by `rm /usr/bin/git` and create a symbolic link from the new git to the old git `ln -s /usr/local/bin/git/bin/git /usr/bin`.

However, even without creating the symlink, Terminal will still search `/usr/local/` by default to find git.

##2. Get started using git

I used [Chris Coyier's screencast tutorial](http://css-tricks.com/video-screencasts/101-lets-suck-at-github-together/) on how to get started using Git by cloning a local project, created a new repo on github.com and upload the local project to the remote repo.

##3. Deploying from git

The first git repo I created was a website project I've been developing locally. I wanted to use git so that other people could start helping me work on it.
The natural next step for me was to figure out how I could deploy my git commits to a remote server through FTP.
My first thought was using a git hook `post-receive`, but it seemed awfully complex and difficult.

[Dandelion](https://github.com/scttnlsn/dandelion) is a much nicer and easier tool to use to deploy. I followed the guide to install it on my Mac and created the config file for each git repo.

#### Note:

- Use `sudo gem install dandelion`, and not just `gem install dandelion`
- For the `exclude` files in config, there should be no tab before the dash - character or it won't work.
- The first deployment might take a while, depending on the size of your repository. But after that, Dandelion is smart enough to only deploy the files that have been added/ changed/ deleted, so it is really quick.

## 4. Workflow
Now, my new work flow includes:

1. Making changes to my working directory
2. `git commit -m 'commit message'`
3. `git push origin master`
4. `dandelion deploy`

While it is true that I can't use automatic deployment with dandelion, I actually prefer to deploy manually like this. I think this would come in handy if I realized that I had made a mistake after a push, I could still go back and make changes before deploying it to my web server.

Another advantage to using this method is that I am deploying from my local git repo. This means that I could push certain files to the server without having them included in the public repo.

### Resources:

- [A great collection of resources by Brad Frost on Git/Github](https://plus.google.com/103751101313992876152/posts/XRT3CsuwBTo)
