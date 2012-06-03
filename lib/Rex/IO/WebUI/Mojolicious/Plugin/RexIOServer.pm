#
# (c) Jan Gehring <jan.gehring@gmail.com>
# 
# vim: set ts=3 sw=3 tw=0:
# vim: set expandtab:
   
package Rex::IO::WebUI::Mojolicious::Plugin::RexIOServer;
   
use strict;
use warnings;

use strict;
use warnings;

use Mojolicious::Plugin;
use Rex::IO::Client;
use base 'Mojolicious::Plugin';

sub register {
   my ( $plugin, $app ) = @_;

   $app->helper(
      rexio => sub {
         my $self = shift;
         return Rex::IO::Client->new;
      }
   );
}

1;
