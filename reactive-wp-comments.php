<?php
/*
   Plugin Name: Reactive WordPress Comments
   Version: 1.0.0
   Author: Nativ3.io
   Author URI: https://www.nativ3.io
   Description: Template for including React in a Wordpress Plugin.
   Text Domain: reactive-wp-comments
   License: GPLv3
*/

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function reactive_wp_comments_scripts() {
  wp_enqueue_script(
    'reactive-wp-comments-main',
    plugins_url( '/assets/js/main.js', __FILE__ ),
    ['wp-element', 'wp-api-fetch'],
    time(),
    true
  );
  wp_localize_script('reactive-wp-comments-main', 'rwpc_object', array(
    'url' => get_home_url(),
    'login_url' => wp_login_url(),
    'nonce' => wp_create_nonce('reactive-wp-comments-nonce'),
    'utc' => get_option('timezone_string'),
    'user' => wp_get_current_user(),
    'post_id' => get_the_ID(),
    'comments' => get_comments_number()
  ));
}
add_action( 'wp_enqueue_scripts', 'reactive_wp_comments_scripts' );


function reactwp_styles() {

  // Register the CSS like this for a plugin:
  wp_enqueue_style(
    'reactive-wp-comments-css',
    plugins_url( '/assets/css/main.css', __FILE__ ),
    [],
    time(),
    'all'
  );

}
add_action( 'wp_enqueue_scripts', 'reactwp_styles' );

/*
add_filter('comments_template', function( $comment_template ){
  global $post;
  if ( !( is_singular() && ( have_comments() || 'open' == $post->comment_status ) ) ) {
    return;
  }

  return dirname(__FILE__) . '/comments.php';
});
*/

add_action( 'rest_api_init', function () {
  register_rest_field( 'comment', 'rwpc_replies', array(
      'get_callback' => function( $comment_arr ) {
          $comments = get_comments( array( 'parent' => $comment_arr['id'], 'hierarchical' => 'flat' ) );
          return $comments;
      },
      'schema' => array(
          'description' => __( 'Comment replies' ),
          'type'        => 'array'
      ),
  ) );

  register_rest_route( 'rwpc/v1', '/comments/(?P<post_id>\d+)', array(
    'methods' => 'GET',
    'callback' => 'rwpc_fetch_comments_by_post_id',
    'args' => array(
      'post_id' => array(
        'validate_callback' => function($param, $request, $key) {
          return is_numeric( $param );
        }
      ),
    ),
  ) );

  add_filter( 'rest_allow_anonymous_comments', function ( $allow_anonymous, $request ) {
    return true;
  }, 10, 2 ); 

} );

function rwpc_fetch_comments_by_post_id( $data ){
  $new_comments = [];
  $args = array(
    'post_id' => $data['post_id'],
  );

  if( $data['status'] ) {
    $args['status'] = $data['status'];
  }else{
    $args['status'] = 'approve';
  }

  if( $data['number'] ) {
    $args['number'] = $data['number'];
  }

  if( $data['paged'] ) {
    $args['paged'] = $data['paged'];
  }

  if( $data['parent_id'] && $data['parent_id'] !== 0 ) {
    $args['parent'] = $data['parent_id'];
    $args['hierarchical'] = 'flat';
    $args['order'] = 'ASC';
  }else{
    $args['parent'] = 0;
  }

  if( $data['comment_id'] ) {
    $comments[] = get_comment( $data['comment_id'] );
  }else{
    $comments = get_comments( $args );
  }

  if ( empty( $comments ) ) {
    return new WP_Error( 'no_comments', 'Invalid comment', array( 'status' => 404 ) );
  }

  foreach ( $comments as $comment ) {
    $cargs =array(
      'parent' => $comment->comment_ID,
      'post_id' => $data['post_id'],
      'hierarchical' => true,
      'status' => 'approve'
    );

    $c = get_comments( $cargs );

    $new_comments[] = (object) array_merge( 
      (array) $comment, 
      array( 
        'comment_author_avatar' => get_avatar_url($comment->comment_author_email),
        'rendered' => wpautop($comment->comment_content),
        'children' => [],
        'replies' => count($c),
        'is_author' => $comment->comment_author_email === get_the_author_meta( 'user_email', get_post_field( 'post_author', $comment->comment_post_ID ) )
      ) 
    );
  }

  return $new_comments;
}
