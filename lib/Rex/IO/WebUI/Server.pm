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

   if($self->req->param("store") && $self->req->param("store") eq "1") {
      $self->render_json($ret);
   }
   else {
      $self->render;
   }
}

sub save_service_key {
   my $self = shift;

   my $json = $self->req->json;

   my $key = $json->{service_key};
   delete $json->{service_key};

   my ($service, $section) = split(/\//, $key);

   for my $_k (keys %{$json}) {
      my $data = $json->{$_k};
      if($data =~ m/^[\[\{]/) {
         $data = Mojo::JSON->new->decode($data);
         $json->{$_k} = $data;
      }
   }

   eval {
      my $ret = $self->rexio->configure_service_of_server(
         $self->stash("name"),
         $service,
         $section,
         $json
      );

      if(ref($ret)) {
         $self->render_json({ok => Mojo::JSON->true});
      }
   };

   if($@) {
      $self->render_json({ok => Mojo::JSON->false}, status => 500);
   }
}

1;
