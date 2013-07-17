---
title: Adding Responsive Lightbox to WordPress
author: tri-nguyen
date: 2012-12-01
template: article.hbs
---

I have finally got around to update all the images on this blog to make use of Lightbox. Woohoo!

Lightbox has been around for a while, and there are many WordPress plugins that allow you to automatically update your blog with it.

However, I have found them to not be very satisfactory for a few reasons. None of them take advantage of the latest version of lightbox plugins. My personal favorite is [fancyBox](http://fancyapps.com/fancybox/), which is responsive as well. Most of them are not responsive, and none of them allows you to group all the images within a post to be in one gallery, which I think is really important.

<span class="more"></span>

Following Bryce Adam's incredibly helpful WPTuts tutorial on [Add a Responsive Lightbox to your WordPress Theme](http://wp.tutsplus.com/tutorials/theme-development/add-a-responsive-lightbox-to-your-wordpress-theme/), I have been able to implement Lightbox on my blog using the latest version of fancyBox. As a front-end developer, this is just a much more intuitive approach for me, rather than using a plugin without knowing what it does.

I followed step 1 and 2 but implemented step 3 a little differently to allow my version to automatically add all images within a post to the same gallery. I know that WordPress has a built-in gallery function, but I don't use it that often and much prefer adding single image as I need to.

Here's my version of the Javacript file:

```javascript
// Initialize the Lightbox for any links with the 'fancybox' class
$(".fancybox").fancybox();
$('article').each(function() {
    var id = $(this).attr('id');
    // add fancybox class to any .jpg, .png, .jpeg and .gif file, as well as a rel attribute to denote that it belongs to a certain post
    $("a[href$='.jpg'], a[href$='.png'], a[href$='.jpeg'], a[href$='.gif']", this).attr('rel', id).addClass("fancybox");
});
```

If you are not sure of the unusual jQuery selector, it means [selecting an anchor tag `a` element with `href` attribute that ends with `.png`](http://stackoverflow.com/questions/303956/jquery-select-a-which-href-contains-some-string) etc.

As an example, here are some pictures I've taken from my recent trip to Chicago that I would like to share. All I did is using the regular WordPress media uploader to import the pictures, without any Gallery configuration.

![A walk along the Chicago River](chicago-river.jpg "A walk along the Chicago River")

![A view of Chicago and its waterfront from the 54th floor](chicago-waterfront.jpg "A view of Chicago and its waterfront from the 54th floor")

![Archway at Loyola University](loyola-archway.jpg "Archway at Loyola University")

![Thanksgiving Dinner Vietnamese style](thanksgiving-dinner-2012.jpg "Thanksgiving Dinner Vietnamese style")

![Panoramic view of Chicago](chicago-panorama.jpg "Panoramic view of Chicago")

P/S: Writing this post has finally made me sit down and implemented [prism.js](http://prismjs.com) for this website too! It is actually quite easy to do. DOUBLE WIN!