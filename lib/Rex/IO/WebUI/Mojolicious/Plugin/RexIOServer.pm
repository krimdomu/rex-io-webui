#
# (c) Jan Gehring <jan.gehring@gmail.com>
# 
# vim: set ts=3 sw=3 tw=0:
# vim: set expandtab:
   
package Rex::IO::WebUI::Mojolicious::Plugin::RexIOServer;

use strict;
use warnings;

use Rex::IO::Client;
use Mojolicious::Plugin;
use base qw(Mojolicious::Plugin);

sub register {
   my ($plugin, $app) = @_;

   $app->helper(
      rexio => sub {
         my $self = shift;
         my $cl = Rex::IO::Client->create(protocol => 1);
         $cl->endpoint = "http://127.0.0.1:5000";

         return $cl;
      }
   );
}

1;
