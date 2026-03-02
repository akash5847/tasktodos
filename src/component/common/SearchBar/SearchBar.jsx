import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

function SearchBar() {
  return (
    <div className="sidebar-search">
      <Input
        allowClear
        placeholder="Search"
        prefix={<SearchOutlined />}
        className="sidebar-search-input"
      />
    </div>
  );
}

export default SearchBar;

