<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( post_password_required() ) {
	return;
}

?>

<div id="reactive-wp-comment"></div>