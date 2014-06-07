#
# (c) Jan Gehring <jan.gehring@gmail.com>
#
# vim: set ts=2 sw=2 tw=0:
# vim: set expandtab:

package Rex::IO::WebUI::Mojolicious::Plugin::RexIOServer;

use strict;
use warnings;

use Rex::IO::Client;
use Mojolicious::Plugin;
use base qw(Mojolicious::Plugin);

use Data::Dumper;

sub register {
  my ( $plugin, $app ) = @_;

  $app->helper(
    rexio => sub {
      my $self = shift;
      my $cl;

      if ( $app->config->{ssl} ) {
        $cl = Rex::IO::Client->create(
          protocol => 1,
          ssl      => $app->config->{server}->{ssl},
          endpoint => "https://"
            . $self->session('user') . ":"
            . $self->session('password') . '@'
            . $app->config->{server}->{url},
        );
      }
      else {
        $cl = Rex::IO::Client->create(
          protocol => 1,
          endpoint => "http://"
            . $self->session('user') . ":"
            . $self->session('password') . '@'
            . $app->config->{server}->{url}
        );
      }

      return $cl;
    }
  );
}

1;
