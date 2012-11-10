package Rex::IO::WebUI::Dashboard;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub index {
   my $self = shift;
   $self->render;
}

sub view {
   my $self = shift;
   $self->render;
}

1;
