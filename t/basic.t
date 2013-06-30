use Mojo::Base -strict;

use Test::More tests => 2;
use Test::Mojo;

# create temporary conf file
my $created_conf = 0;
if(! -f "webui.conf") {
$created_conf = 1;
open(my $tmp, ">", "webui.conf") or die($!);
print $tmp qq~

{
   server => {
      url      => "http://localhost:5000",
      user     => "admin",
      password => "admin",
   },

   session => {
      key => "Rex.IO.WebUI",
   },

   plugins => [
      # basic plugins
      # needed for bare metal deployment
      "Server",
      "Deploy",
      "Dns",
      "Dhcp",
      "User",
   ],

};

~;
close($tmp);
}


my $t = Test::Mojo->new('Rex::IO::WebUI');
$t->get_ok('/')->status_is(302);


if($created_conf) {
   unlink "webui.conf";
}

