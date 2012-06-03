#
# (c) Jan Gehring <jan.gehring@gmail.com>
# 
# vim: set ts=3 sw=3 tw=0:
# vim: set expandtab:
   

package Rex::IO::WebUI::Dashboard;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub index {
   my $self = shift;
   $self->render;
}

1;
