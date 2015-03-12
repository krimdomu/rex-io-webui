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
  $self->render("group/list");
}

sub add {
  my ($self) = @_;
  my $ret = $self->rexio->call(
    "POST", "1.0", "group",
    group => undef,
    ref   => $self->req->json->{data}
  );
  $self->render( json => $ret );
}

sub delete {
  my ($self) = @_;
  my $ret = $self->rexio->call( "DELETE", "1.0", "group",
    group => $self->param("group_id") );
  $self->render( json => $ret );
}

sub add_user_to_group {
  my ($self) = @_;
  my $ret = $self->rexio->call(
    "POST", "1.0", "group",
    group => $self->param("group_id"),
    user  => $self->param("user_id")
  );
  $self->render( json => $ret );
}

sub __register__ {
  my ($app) = @_;

  $app->register_url(
    {
      plugin => "group",
      meth   => "GET",
      auth   => Mojo::JSON->true,
      url    => "/",
      root   => Mojo::JSON->false,
      func   => \&list,
    }
  );

  $app->register_url(
    {
      plugin => "group",
      meth   => "POST",
      auth   => Mojo::JSON->true,
      url    => "/",
      root   => Mojo::JSON->false,
      func   => \&add,
    }
  );

  $app->register_url(
    {
      plugin => "group",
      meth   => "POST",
      auth   => Mojo::JSON->true,
      url    => "/:group_id/user/:user_id",
      root   => Mojo::JSON->false,
      func   => \&add_user_to_group,
    }
  );

  $app->register_url(
    {
      plugin => "group",
      meth   => "DELETE",
      auth   => Mojo::JSON->true,
      url    => "/:group_id",
      root   => Mojo::JSON->false,
      func   => \&delete,
    }
  );

  $app->register_url(
    {
      plugin => "group",
      meth   => "POST",
      auth   => Mojo::JSON->true,
      url    => "/group",
      api    => Mojo::JSON->true,
      func   => \&add,
    }
  );

  $app->register_url(
    {
      plugin => "group",
      meth   => "DELETE",
      auth   => Mojo::JSON->true,
      url    => "/group/:group_id",
      api    => Mojo::JSON->true,
      func   => \&delete,
    }
  );
}

1;
