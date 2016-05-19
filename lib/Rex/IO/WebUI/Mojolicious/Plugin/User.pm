#
# (c) Jan Gehring <jan.gehring@gmail.com>
#
# vim: set ts=2 sw=2 tw=0:
# vim: set expandtab:

package Rex::IO::WebUI::Mojolicious::Plugin::User;

use strict;
use warnings;

use Mojolicious::Plugin;

use base 'Mojolicious::Plugin';

sub register {
  my ( $plugin, $app ) = @_;

  $app->helper(
    has_permission => sub {
      my ( $self, $perm ) = @_;
      my ($has_perm) = grep { $_ eq $perm } @{ $self->session('permissions') };
      if ($has_perm) {
        $app->log->debug("user has permission: $perm");
        return 1;
      }

      $app->log->debug("user has NO permission: $perm");
      return 0;
    }
  );

}

1;
