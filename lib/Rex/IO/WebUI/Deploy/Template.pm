package Rex::IO::WebUI::Deploy::Template;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

# This action will render a template
sub show_templates {
   my ($self) = @_;
   $self->render;
}

1;
