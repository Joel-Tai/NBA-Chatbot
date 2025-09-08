import { SearchInput } from "@/components/input";

interface HeaderProps {
  searchInputRef: React.Ref<any>;
}

const Header: React.FC<HeaderProps> = ({ searchInputRef }) => (
  <header
    className="w-full sticky top-0 z-50"
    style={{
      background:
        "linear-gradient(to top, rgba(239,246,255,0) 0%, #eff6ff 100%)",
    }}
  >
    <div
      className="w-full flex items-center py-4"
      style={{ position: "relative" }}
    >
      <h1 className="text-2xl font-bold flex-shrink-0">Basketball Chat Bot</h1>
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1/2 flex justify-center">
        <SearchInput ref={searchInputRef} />
      </div>
    </div>
  </header>
);

export default Header;
