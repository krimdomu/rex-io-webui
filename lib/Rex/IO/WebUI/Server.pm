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

   shift @key_parts; shift @key_parts; shift @key_parts;

   $self->stash("key", join("/", @key_parts));

   $self->render;
}

1;
