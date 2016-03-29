<!DOCTYPE html>
<html>
  <head>
    <title>YT-Playlist-Viewer</title>
  </head>

  <body>
  
    <?php
	
	  parse_str(implode('&', array_slice($argv, 1)), $_GET);
	
	  $pl = '';
	
	  if(isset($_GET['pl']))
	  {
	    $pl = $_GET['pl'];
	  }
	
	?>
  
    <p><form action="plviewer.php">
      <label for="pl">Playlist-ID: </label><input type="text" id="pl" name="pl" value="<?php echo($pl); ?>">
	  <input type="submit" value="View!">
    </form></p>
	
	<?php
	
	  if(!empty($pl))
	  {
	    echo('YT-PL-ID: ');
	    print_r($pl);
	  }
	
	?>
	
    <p><a href="../../index.html">Go back to main page</a></p>
  </body>
  
</html>