defmodule SqlSpCacheWeb.StatsChannel do
  @moduledoc false

  use Phoenix.Channel

  alias SqlSpCacheWeb.CachePoller

  def join("stats:all", _message, socket) do
    {:ok, socket}
  end

  def handle_in("poll", _payload, socket) do
    CachePoller.start()
    {:noreply, socket}
  end
end
