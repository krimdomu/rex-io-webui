#
# (c) Jan Gehring <jan.gehring@gmail.com>
# 
# vim: set ts=3 sw=3 tw=0:
# vim: set expandtab:
   

package Rex::IO::WebUI::User;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

# This action will render a template
sub list {
   my ($self) = @_;
   $self->render;
}

sub add {
   my ($self) = @_;
   my $ret = $self->rexio->add_user(%{ $self->req->json });
   $self->render_json($ret);
}

sub delete {
   my ($self) = @_;
   my $ret = $self->rexio->del_user($self->param("user_id"));
   $self->render_json($ret);
}

1;
