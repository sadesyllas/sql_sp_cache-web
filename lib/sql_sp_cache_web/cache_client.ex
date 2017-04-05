defmodule SqlSpCacheWeb.CacheClient do
  @moduledoc false
  @mod __MODULE__

  use GenServer

  import SqlSpCacheWeb.Utilities, only: [get_request_header: 1]

  require Logger

  def start_link(host, port, command_timeout)
  do
    GenServer.start_link(@mod, %{host: host, port: port, command_timeout: command_timeout}, name: @mod)
  end

  def heartbeat()
  do
    GenServer.call(@mod, :heartbeat)
  end

  def stats()
  do
    GenServer.call(@mod, :stats)
  end

  def handle_call(command, _from, %{host: host, port: port, command_timeout: command_timeout} = state)
  when command in [:heartbeat, :stats]
  do
    Logger.debug("Sending :#{to_string(command)} command")

    result =
      with\
        {:ok, client} <- :gen_tcp.connect(to_charlist(host), port, [:binary, {:active, false}, {:reuseaddr, true}]),
        :ok <- :gen_tcp.send(client, get_command_payload(command)),
        {:ok, <<x, y, z, w>>} <- :gen_tcp.recv(client, 4, command_timeout),
        length <- Integer.undigits([x, y, z, w], 256),
        {:ok, response} <- :gen_tcp.recv(client, length, command_timeout)
      do
        :gen_tcp.close(client)
        parse_command_response(command, response)
      else
        _ -> %{status: "red"}
      end
    {:reply, result, state}
  end

  # get_command_payload

  defp get_command_payload(:heartbeat)
  do
    {:ok, heartbeat_command} = Poison.encode(%{sp: ":heartbeat"})
    get_request_header(heartbeat_command) <> heartbeat_command
  end

  defp get_command_payload(:stats)
  do
    {:ok, stats_command} = Poison.encode(%{sp: ":stats"})
    get_request_header(stats_command) <> stats_command
  end

  # parse_command_response

  defp parse_command_response(:heartbeat, response)
  do
    Logger.debug("Received :heartbeat response: #{inspect(response)}")

    case Poison.decode(response) do
      {:ok, %{"health" => "ok"} = heartbeat} -> %{status: "green", heartbeat: heartbeat}
      _ -> %{status: "red"}
    end
  end

  defp parse_command_response(:stats, response)
  do
    Logger.debug("Received :stats response: #{inspect(response)}")

    case Poison.decode(response) do
      {:ok, stats} -> %{status: "green", stats: stats}
      _ -> %{status: "red", stats: %{}}
    end
  end
end
