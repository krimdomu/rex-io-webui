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

sub login {
   my ($self) = @_;
   $self->render;
}

sub login_do_auth {
   my ($self) = @_;

   if($self->authenticate($self->param("user"), $self->param("password"))) {
   print STDERR "redirecting\n";
      $self->redirect_to("/");
   }

   $self->render("dashboard/login");

}

sub check_login {
   my ($self) = @_;
   $self->redirect_to("/login") and return 0 unless($self->is_user_authenticated);
   return 1;
}

1;
