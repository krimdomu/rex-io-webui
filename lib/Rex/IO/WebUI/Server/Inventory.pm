#
# (c) Jan Gehring <jan.gehring@gmail.com>
# 
# vim: set ts=3 sw=3 tw=0:
# vim: set expandtab:
   
package Rex::IO::WebUI::Server::Inventory;
   
use strict;
use warnings;

use Mojo::Base 'Mojolicious::Controller';

use Mojo::JSON;
use Data::Dumper;

sub get {
   my $self = shift;

   my $server = $self->chi->get($self->stash("name"));
   
   if(!$server) {
      $server = $self->rexio->get_server($self->stash("name"));
      $self->chi->set($self->stash("name"), $server);
   }

   if(ref($server->{inventory}->{CPUS}) ne "ARRAY") {
      $server->{inventory}->{CPUS} = [ $server->{inventory}->{CPUS} ];
   }

   if(ref($server->{inventory}->{STORAGES}) ne "ARRAY") {
      $server->{inventory}->{STORAGES} = [ $server->{inventory}->{STORAGES} ];
   }

   $server->{inventory}->{NETWORKCARDS} = [ grep { $_->{TYPE} eq "Network controller" || $_->{TYPE} eq "Ethernet controller" } @{ $server->{inventory}->{CONTROLLERS} } ];

   $self->stash("inventory", $server->{inventory});

   $self->render;
}


1;
