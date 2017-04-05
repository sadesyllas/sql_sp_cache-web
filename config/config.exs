# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# Configures the endpoint
config :sql_sp_cache_web, SqlSpCacheWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "ytFfFjGqrqitO/bpAxzFReqYk1dBflMeYgkqxj7f3TIP4N5k2LEhV4tqFLJthkPf",
  render_errors: [view: SqlSpCacheWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: SqlSpCacheWeb.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
