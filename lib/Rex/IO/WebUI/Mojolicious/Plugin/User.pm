#
# (c) Jan Gehring <jan.gehring@gmail.com>
#
# vim: set ts=2 sw=2 tw=0:
# vim: set expandtab:

package Rex::IO::WebUI::Mojolicious::Plugin::User;

use strict;
use warnings;

use Mojolicious::Plugin;
use Rex::IO::WebUI::Auth::User;

use base 'Mojolicious::Plugin';

sub register {
  my ( $plugin, $app ) = @_;

  $app->helper(
    get_user => sub {
      my ( $self, $uid ) = @_;

      my $u = Rex::IO::WebUI::Auth::User->new( app => $app );
      return $u->load($uid);
    }
  );

}

1;
