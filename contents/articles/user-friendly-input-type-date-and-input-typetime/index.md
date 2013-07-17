---
title: User-friendly input[type=date] and input[type=time]
author: tri-nguyen
date: 2013-02-18
template: article.html
---

To make a HTML form easier and friendlier for users to use, HTML5 incorporates quite a few [new input types](http://www.html5rocks.com/en/tutorials/forms/html5forms/#toc-inputs-attributes-types). While `url`, `tel` and `email` types have been quite useful when using a mobile device (special keyboard layouts), I find the biggest pain point is with input date and time. Most of the times you don't know what format to input the date in (month first or date first), whether you should use dash versus slash, whether you should include the year etc. <span class="more"></span>

Many solutions have been used to solve this problem. jQuery plugins [datepicker](http://jqueryui.com/datepicker/) and [timepicker](http://jonthornton.github.com/jquery-timepicker/) are really helpful on desktop. Mobile browsers have done a good job using native date and time picker (Android and iOS) when the input type is specified.

How do we combine both of these solutions to create a single responsive web form? The answer is really simple.

My first response was to just call the `datepicker()` method on any and all `input[type=date]` elements.
```javascript
jQuery( document ).ready( function( $ ) {
  $( 'input[type=date]' ).each( function() {
    $( this ).datepicker();
  } );
} );
```
There is a few problems associated with this:

- `input[type=date]` does not work very well with datepicker. That means whatever value you select using the datepicker will not be registered on the input field.
- `datepicker()` is not very useful on mobile devices. The pop up window isn't the most user friendly thing.

In order to solve these two problems, the answer would be to:

1. Use `input[type=text]` on desktop as well as call `datepicker()` method.
2. Use `input[type=date]` on mobile (touch-enabled) devices and not call `datepicker()`.

This can be achieved using [Modernizr](http://modernizr.com/) to detect whether the device is touch-enabled, and JavaScript to swap out the `input[type=date]` element with one of type text.

This could be done with the following snippet:
```javascript
if ( !$( 'html' ).hasClass( 'touch' ) ){
	$( 'input[type=date]' ).each( function() {
		$( this ).clone().attr( 'type', 'text' ).insertAfter( this ).datepicker().prev().remove();
	} );
}
```
This code basically copies the input element, converts it to `input[type=text]`, calls the `datepicker()` method on it and then removes the previous element.

Admittedly, this method seems like a bit of a hack. At least it will be until jQuery UI datepicker plugin is updated to work with `input[type=date]`. After that, we can just use Modernizr to selectively call it on desktop browsers without having to do the whole copy and remove business.

Give credit where credit is due: the clone/ remove code is not originally mine. I found it on [stackoverflow](http://stackoverflow.com/a/12617534/1368032). I modified it a little bit to make it work with my situation.

Here's a codepen I set up to demo this.
<pre class="codepen" data-height="300" data-type="result" data-href="nhbql" data-user="tnguyen14" data-safe="true"><code></code><a href="http://codepen.io/tnguyen14/pen/nhbql">Check out this Pen!</a></pre>
<script async src="http://codepen.io/assets/embed/ei.js"></script>

The example I've used is for `datepicker()`. `timepicker()` should also work in a similar way.