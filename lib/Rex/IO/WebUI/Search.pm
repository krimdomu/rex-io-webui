package Rex::IO::WebUI::Search;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub index {
  my $self = shift;
  my $data = $self->rexio->search_server($self->param("term"));

  my @ret = ();
  for my $srv (@{$data}) {
    push(@ret, { label => $srv->{name}, value => $srv->{name}, srv_id => $srv->{id} });
  }

  $self->render(json => \@ret);
}

1;
