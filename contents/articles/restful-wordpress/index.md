---
title: RESTful WordPress
author: tri-nguyen
date: 2013-03-28
template: article.hbs
---

WordPress is an incredibly powerful and user-friendly web platform. It is loved by both developers and users alike. WordPress's polished `wp-admin` and Dashboard are probably one of the biggest reasons WordPress is chosen by many people as their go-to CMS. As a developer, I pick WordPress over other CMSes whenever I feel my client need a friendly CMS to manage their rich content in a smart and usable way, which turns out to be quite often.

In the State of the Word speech in 2012, Matt Mullenweg outlined a vision for WordPress with an even bigger emphasis on making `wp-admin` more user-friendly. I think this is a great direction to follow, given how User Experience has become the focal point in web development work in the past couple of years. In the same talk, Matt also shared his vision for WordPress being used more for web applications. Now this really got me off my seat.

Imagine a day when you are able to query every single bit of information that is on your WordPress site, from each Custom Post Type (CPT) and its custom meta fields to every user meta data. This will transform WordPress into a true web application powerhouse, with RESTful APIs on the back end and a stellar front end interface. The introduction of the REST API in JetPack 1.9 is a big step in that direction. However, there's still much to be done.

A few months ago, I started working on a mobile application with a few friends. We wanted to make a [nice tool](http://appstore.com/cowduck) for students to create meaningful interactions through a small on-campus social network. During the architectural design process, being a true WordPress developer, I urged the group to use WordPress as our backend. I was very optimistic that we could turn WordPress into a RESTful API while leveraging on the current familiar theme templates to rapidly build and deploy a web app version. We could then focus more of our time on designing and making the iOS app more user-friendly. Unfortunately, with a 3 month deadline in mind, we decided against using WordPress because the Jetpack REST API only supports regular post types and not CPTs (we also decided not to build an independent REST API because that would take even longer). This was a bummer because with a secure and mature user management system and a tested framework for interacting with the database in place, coupled with many plugins for optimization, WordPress would be the ideal candidate for small teams like ours to deploy mobile and web applications that rely on a solid backend in a relatively short period of time.

This experience led me to believe that there is a huge potential for making the WordPress Core RESTful. With work already done in Jetpack, I think that we're already more than half way to achieving this goal. I don't think the rest of the way is easy (or otherwise it would already be done), especially in trying to extend Core while maintaining it backward compatible. Nonetheless, being able to achieve this will put WordPress to the front and center of a developer's toolkit in building awesome applications.

There are many benefits to this.

- First, as I mentioned earlier, this will allow users to query any bit of information in the database, not just from the comfort of their theme template, but anywhere else on the web (provided that a proper secure authorization and session management system is implemented).This is scarily empowering.
- If we get it right and make the API as open and extensible as possible, other developers can write plugins to extend the API for more sophisticated querying.
- A RESTful API is a huge enabler for many developers, big and small, to run with it and create amazing applications and not being bogged down by having to create their own REST API (just like our team was).
- It leverages on WordPress's powerful `wp-admin` and Dashboard to manage and interact with the data, a system not many other APIs have. This means regular users can actively participate in the app development process.
- Developers can use their existing content and architecture to build new applications without much need for database migration, which could be a big hurdle.

Despite these potentials, a quick search for REST API plugins from the WordPress plugin repository revealed only a couple of plugins which have not been maintained for more than 2 years (highly rated plugins nonetheless). I am not certain what the reason for that would be, but there have been definitely a lot of changes in the WordPress Core for the last 2 years. My dream right now is to be able to spend a few months focusing on building a more fully featured REST API for WordPress.

It would not be easy to do that all by myself, but if I were in a team of really talented and experienced developers who know WordPress in and out,the process would be a lot more fun and productive. Another important thing is knowing how to test the features and make sure it is scalable. These are the things the good people at Automattic do really well. But more than anything else, working on this would be a great learning experience.