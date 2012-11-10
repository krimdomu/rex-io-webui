package Rex::IO::WebUI::Dns;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

# This action will render a template
sub show_tld {
   my ($self) = @_;
   $self->render;
}

sub update_tld_record {
   my ($self) = @_;
   #print STDERR Dumper($self->req);
   $self->render_text($self->param("value"));
}

1;
