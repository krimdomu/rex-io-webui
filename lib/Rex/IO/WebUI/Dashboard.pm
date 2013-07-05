package Rex::IO::WebUI::Dashboard;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub index {
   my $self = shift;

   my @main_menu;

   # load navigation from plugins
   for my $plugin (@{ $self->config->{plugins} }) {
      my $template_path = "\L$plugin";
      my $template = $self->render("$template_path/ext/mainmenu", partial => 1);
      if($template) {
         push @main_menu, $template;
      }
   }

   $self->stash(main_menu => \@main_menu);
   
   $self->render;
}

sub view {
   my $self = shift;

   my (@dashboard, @dashboard_stats);

   # load dashboard (statistics) from plugins

   # load dashboard from plugins
   for my $plugin (@{ $self->config->{plugins} }) {
      my $template_path = "\L$plugin";
      my $template = $self->render("$template_path/ext/dashboard", partial => 1);
      if($template) {
         push @dashboard, $template;
      }

      my $template2 = $self->render("$template_path/ext/dashboard_stats", partial => 1);
      if($template2) {
         push @dashboard_stats, $template2;
      }
   }

   $self->stash(dashboard       => \@dashboard);
   $self->stash(dashboard_stats => \@dashboard_stats);

   $self->render;
}

sub login {
   my ($self) = @_;
   $self->render;
}

sub login_do_auth {
   my ($self) = @_;

   if($self->authenticate($self->param("user"), $self->param("password"))) {
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
