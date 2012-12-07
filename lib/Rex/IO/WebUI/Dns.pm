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

sub add_record {
   my ($self) = @_;

   my $option = $self->req->json;
   $option->{type} = $self->param("type");
   my $ret = $self->rexio->add_dns_record($self->param("domain"), $self->param("host"), %{ $option });

   $self->render_json($ret);
}

sub del_record {
   my ($self) = @_;

   my $domain = $self->param("domain");
   my $type   = $self->param("type");
   my $host   = $self->param("host");

   my $ret = $self->rexio->del_dns_record($domain, $host, $type);

   $self->render_json($ret);
}

1;
