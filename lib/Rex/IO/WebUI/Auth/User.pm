#
# (c) Jan Gehring <jan.gehring@gmail.com>
# 
# vim: set ts=3 sw=3 tw=0:
# vim: set expandtab:
   
package Rex::IO::WebUI::Auth::User;

use strict;
use warnings;

sub new {
   my $that = shift;
   my $proto = ref($that) || $that;
   my $self = { @_ };

   bless($self, $proto);

   return $self;
}

sub id       { shift->{data}->{id} };
sub name     { shift->{data}->{name} };

sub load {
   my ($self, $uid) = @_;

   my $user = $self->app->rexio->get_user($uid);

   if($user) {
      $self->{data} = $user;
   }

   return $self;
}

sub app { shift->{app} };

1;
