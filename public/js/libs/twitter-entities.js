/*
 * twitter-entities.js
 * This function converts a tweet with "entity" metadata 
 * from plain text to linkified HTML.
 *
 * See the documentation here: http://dev.twitter.com/pages/tweet_entities
 * Basically, add ?include_entities=true to your timeline call
 *
 * Copyright 2010, Wade Simmons
 * Licensed under the MIT license
 * http://wades.im/mons
 *
 * Modified for SuccessWhale by Ian Renton
 *
 * Requires jQuery
 */

function linkify_entities(content) {
    
    // This is very naive, should find a better way to parse this
    var index_map = {};
    
    // Replace links with properly linked HTML
    if (typeof content.links !== 'undefined') {
      $.each(content.links, function(i,entry) {
          if (typeof entry.indices !== 'undefined') {
              index_map[entry.indices[0]] = [entry.indices[1], function(text) {
                  // If there's a preview, this will be handled separately so just remove the section of the text that refers to it. Otherwise, preserve the text and link it up by appling an A tag.
                  if (typeof entry.preview === 'undefined') {
                    return "<a href='"+entry.url+"'>"+entry.title+"</a>";
                  }
                  else {
                    return "";
                  }}];
          }
      });
    }
    
    // Replace hashtags with properly linked HTML
    if (typeof content.hashtags !== 'undefined') {
      $.each(content.hashtags, function(i,entry) {
          index_map[entry.indices[0]] = [entry.indices[1], function(text) {return "<a href='http://twitter.com/search?q="+escape("#"+entry.text)+"'>#"+entry.text+"</a>";}];
      });
    }
    
    // Replace usernames with properly linked HTML
    if (typeof content.usernames !== 'undefined') {
      $.each(content.usernames, function(i,entry) {
          index_map[entry.indices[0]] = [entry.indices[1], function(text) {return "<a title='"+entry.user+"' href='http://twitter.com/"+escape(entry.user)+"'>@"+entry.user+"</a>";}];
      });
    }
    
    var result = "";
    var last_i = 0;
    var i = 0;
    
    // iterate through the string looking for matches in the index_map
    for (i=0; i < content.text.length; ++i) {
        var ind = index_map[i];
        if (ind) {
            var end = ind[0];
            var func = ind[1];
            if (i > last_i) {
                result += content.text.substring(last_i, i);
            }
            result += func(content.text.substring(i, end));
            i = end - 1;
            last_i = end;
        }
    }
    
    if (i > last_i) {
        result += content.text.substring(last_i, i);
    }
    
    // Add a "source" link if we just have a single link with no indices for replacing text
    if ((typeof content.links !== 'undefined') && (content.links.length===1) && (typeof content.links[0].indices === 'undefined')) {
      result += '<br/><a href="' + content.links[0].url + '">';
      if (content.links[0].title !== null) {
        result += content.links[0].title;
      } else {
        result += '(source)';
      }
      result += '</a>';
    }
  
    // Add media previews
    for (i=0; i<content.links.length; i++)
    {
      if (typeof content.links[i].preview !== 'undefined') {
        result += '<div class="item-mediapreview"><a href="' + content.links[i].url + '"><img class="item-mediapreview" src="' + content.links[i].preview + '" /></a></div>';
      }
    }
    
    return result;
}