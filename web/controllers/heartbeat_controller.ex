defmodule SqlSpCacheWeb.HeartbeatController do
    @moduledoc false

    use SqlSpCacheWeb.Web, :controller

    alias SqlSpCacheWeb.CacheClient

    def index(conn, _params)
    do
      status =
        case  CacheClient.heartbeat() do
          %{status: "green"} -> 200
          _ -> 503
        end
      send_resp(conn, status, "")
    end
end
