#
# (c) Jan Gehring <jan.gehring@gmail.com>
# 
# vim: set ts=2 sw=2 tw=0:
# vim: set expandtab:
  

package Rex::IO::WebUI::Group;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;

# This action will render a template
sub list {
  my ($self) = @_;
  $self->render;
}

sub add {
  my ($self) = @_;
  my $ret = $self->rexio->add_group(%{ $self->req->json });
  $self->render(json => $ret);
}

sub delete {
  my ($self) = @_;
  my $ret = $self->rexio->del_group($self->param("group_id"));
  $self->render(json => $ret);
}

sub add_user_to_group {
  my ($self) = @_;
  my $ret = $self->rexio->add_user_to_group($self->param("user_id"), $self->param("group_id"));
  $self->render(json => $ret);
}

1;
