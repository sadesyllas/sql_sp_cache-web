defmodule SqlSpCacheWeb.CachePoller do
  @moduledoc false
  @mod __MODULE__
  @poll_interval 5_000

  use GenServer

  alias SqlSpCacheWeb.Endpoint
  alias SqlSpCacheWeb.CacheClient

  def start_link()
  do
    GenServer.start_link(@mod, %{started: false}, name: @mod)
  end

  def start()
  do
    GenServer.call(@mod, :start)
  end

  def handle_call(:start, _from, %{started: false} = state)
  do
    poll()
    {:reply, :ok, %{state | started: true}}
  end

  def handle_call(:start, _from, %{started: true} = state)
  do
    {:reply, :ok, state}
  end

  def handle_info(:poll, state)
  do
    poll()
    {:noreply, state}
  end

  defp schedule_poll()
  do
    Process.send_after(@mod, :poll, @poll_interval)
  end

  defp poll()
  do
    heartbeat = CacheClient.heartbeat()
    push_heartbeat(heartbeat)
    stats = CacheClient.stats()
    push_stats(stats)
    schedule_poll()
  end

  defp push_heartbeat(heartbeat)
  do
    Endpoint.broadcast("stats:all", "heartbeat", heartbeat)
  end

  defp push_stats(stats)
  do
    Endpoint.broadcast("stats:all", "stats", stats)
  end
end
