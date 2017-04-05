defmodule SqlSpCacheWeb.Utilities do
  @moduledoc false

  use Bitwise

  def get_request_header(data)
  do
    byte_count = byte_size(data)
    [&(&1 >>> 8), &(&1 &&& 255)]
    |> Enum.reduce(<<>>, fn to_byte_value, data_header -> data_header <> <<to_byte_value.(byte_count)>> end)
  end
end
