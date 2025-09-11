import { SearchInput } from "@/components/input";
import ballImg from "@/assets/bball.png";

interface HeaderProps {
  searchInputRef: React.Ref<any>;
}

const Header: React.FC<HeaderProps> = ({ searchInputRef }) => (
  <header
    className="w-full sticky top-0 z-50"
    style={{
      background: "#F0EFFF",
    }}
  >
    <div
      className="w-full flex items-center py-4"
      style={{ position: "relative" }}
    >
      <div className="flex items-center gap-3 pl-6">
        <img
          src={ballImg}
          alt="Basketball Logo"
          className="h-10 w-10 object-contain"
        />
        <h1 className="text-2xl font-bold flex-shrink-0">
          Basketball Chat Bot
        </h1>
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1/2 flex justify-center">
        <SearchInput ref={searchInputRef} />
      </div>
    </div>
  </header>
);

export default Header;
