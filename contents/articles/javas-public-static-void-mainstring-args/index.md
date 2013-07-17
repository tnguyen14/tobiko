---
title: Java's public static void main(String[] args)
author: tri-nguyen
date: 2012-09-19
template: article.html
---

*or "what the hell have I got myself into?"*

<span class="more"></span>

As a new Java programmer, I keep asking myself, what does this line of code `public static void main(String[] args)` that is at the beginning of every Java program means?

After poking around, I found out [the answer for this on a Java Forums](http://www.java-forums.org/new-java/25023-public-static-void-main-string-args.html). Here's the answer in short:
>The method is **public** because it be accessible to the JVM to begin execution of the program.

>It is **static** because it be available for execution without an object instance. you may know that you need an object instance to invoke any method. So you cannot begin execution of a class without its object if the main method was not static.

>It returns only a **void** because, once the main method execution is over, the program terminates. So there can be no data that can be returned by the Main method

>The last parameter is **String args[]**. This is used to signify that the user may opt to enter parameters to the java program at command line. We can use both String[] args or String args[]. The Java compiler would accept both forms.
-- [arefeh from Java Forums](http://www.java-forums.org/new-java/25023-public-static-void-main-string-args.html)

This might seem like a trivial post, but I wanted to have it here to remind me of what it means later, and as a quick way for me to reference it.