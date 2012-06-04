#
# (c) Jan Gehring <jan.gehring@gmail.com>
# 
# vim: set ts=3 sw=3 tw=0:
# vim: set expandtab:
   
package Rex::IO::WebUI::Server;
use Mojo::Base 'Mojolicious::Controller';

use Mojo::JSON;
use Data::Dumper;

sub edit {
   my $self = shift;
   $self->render;
}

sub edit_service_key {
   my $self = shift;

   my $uri = $self->req->url;
   my @key_parts = split(/\//, $uri);

   $self->stash("key", join("/", @key_parts[4..$#key_parts]));
   $self->stash("url", $uri . "?store=1");

   my $ret = $self->rexio->get_variables(
      type   => "service",
      module => $self->stash("service"),
      #key    => join("/", @key_parts[5,7..$#key_parts]),
      key    => $key_parts[5],
      server => $self->stash("name"),
   );

   $self->stash("variables", $ret);

   print STDERR Dumper($ret);

   if($self->req->param("store") && $self->req->param("store") eq "1") {
      $self->render_json($ret);
   }
   else {
      $self->render;
   }
}

1;
