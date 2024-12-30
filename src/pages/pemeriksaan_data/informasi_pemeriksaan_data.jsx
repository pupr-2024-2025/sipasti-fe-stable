import React, { useState, useEffect } from "react";
import Navbar from "../../components/navigationbar";
import Pagination from "../../components/pagination";
import informasi_tahap_pemeriksaan_data_store from "./informasi_pemeriksaan_data_store/informasi_tahap_pemeriksaan_data";
import { More, ClipboardText } from "iconsax-react";
import colors from "../../styles/colors";
import Link from "next/link";
import Modal from "../../components/modal";
import { CloseCircle } from "iconsax-react";
import SearchBox from "../../components/searchbox";
import TextInput from "../../components/input";
import Button from "../../components/button";
import { useRouter } from "next/router";

export default function informasi_tahap_pemeriksaan() {
  const [activeVendorMenu, setActiveVendorMenu] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const { vendor = [] } = informasi_tahap_pemeriksaan_data_store(
    (state) => state.initialValues
  );
  const fetchPDF = informasi_tahap_pemeriksaan_data_store(
    (state) => state.fetchPDF
  );
  const { fetchVendor, fetchGenerateLink } =
    informasi_tahap_pemeriksaan_data_store();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentModal, setCurrentModal] = useState(1);
  const itemsPerPage = 10;
  const itemsPerPageModal = 5;
  const {
    initialValues,
    fetchStatusPemeriksaanData,
    urlKuisionerResult,
    setUrlKuisionerResult,
    resetUrlKuisionerResult,
  } = informasi_tahap_pemeriksaan_data_store();
  const { status_pemeriksaan_data } = initialValues;
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    alignRight: false,
  });

  const router = useRouter();
  const { id } = router.query;

  // useEffect(() => {
  //   if (id) {
  //     console.log("shortlist_id yang dikirim:", id);
  //     fetchDataEntriData(id);
  //   }
  // }, [id, fetchDataEntriData]);

  const handleFilterClick = (filters) => {
    const updatedFilters = { ...activeFilters };
    filters.forEach((filter) => {
      updatedFilters[filter.accessor] = filter.checked;
    });
    setActiveFilters(updatedFilters);
    applySearchAndFilter(searchQuery, updatedFilters);
  };

  const applySearchAndFilter = (query, filters) => {
    const lowerQuery = query.toLowerCase();
    const isFilterActive = Object.values(filters).some((value) => value);

    const result = vendor.filter((item) => {
      const matchesSearch =
        item.nama_vendor?.toLowerCase().includes(lowerQuery) ||
        item.pemilik_vendor?.toLowerCase().includes(lowerQuery) ||
        item.alamat?.toLowerCase().includes(lowerQuery) ||
        item.kontak?.toLowerCase().includes(lowerQuery);

      if (!isFilterActive) {
        return matchesSearch;
      }

      const matchesFilter = Object.keys(filters).some((key) => {
        return filters[key] && item[key]?.toLowerCase().includes(lowerQuery);
      });

      return matchesSearch && matchesFilter;
    });

    setFilteredVendor(result);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerateLinkModalOpen, setIsGenerateLinkModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVendor, setFilteredVendor] = useState([]);

  const filterOptions = [
    { label: "Responden/Vendor", accessor: "nama_vendor", checked: false },
    { label: "Sumber Daya", accessor: "sumber_daya", checked: false },
    { label: "Pemilik Vendor", accessor: "pemilik_vendor", checked: false },
    { label: "Alamat", accessor: "alamat", checked: false },
    { label: "Kontak", accessor: "kontak", checked: false },
  ];

  useEffect(() => {
    setFilteredVendor(vendor);
  }, [vendor]);

  const handleLinkClick = async (shortlist_id) => {
    if (!shortlist_id) {
      alert("ID Shortlist tidak ditemukan.");
      console.error("Shortlist ID is null or undefined");
      return;
    }
    const urlKuisioner = await fetchPDF(shortlist_id);
    if (urlKuisioner) {
      window.open(urlKuisioner, "_blank");
    } else {
      alert("Gagal mendapatkan link kuisioner. Silakan coba lagi.");
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applySearchAndFilter(query, activeFilters);
  };

  const handleToggleMenu = (rowId, event) => {
    if (activeMenu === rowId) {
      setActiveMenu(null);
    } else {
      const rect = event.target.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const menuWidth = 200;

      let positionLeft = rect.left + window.scrollX;
      let alignRight = false;

      if (positionLeft + menuWidth > screenWidth) {
        positionLeft = screenWidth - menuWidth - 10;
        alignRight = true;
      }

      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: positionLeft,
        alignRight: alignRight,
      });
      setActiveMenu(rowId);
    }
  };

  const handleToggleVendorMenu = (vendorId, event) => {
    console.log("Toggling vendor menu for ID:", vendorId);
    if (activeVendorMenu === vendorId) {
      setActiveVendorMenu(null);
    } else {
      const rect = event.target.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const menuWidth = 200;

      let positionLeft = rect.left + window.scrollX;
      let alignRight = false;

      if (positionLeft + menuWidth > screenWidth) {
        positionLeft = screenWidth - menuWidth - 10;
        alignRight = true;
      }

      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: positionLeft,
        alignRight: alignRight,
      });
      setActiveVendorMenu(vendorId);
    }
  };

  useEffect(() => {
    fetchStatusPemeriksaanData();
  }, [fetchStatusPemeriksaanData]);

  const paginatedData = status_pemeriksaan_data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const paginatedVendor = Array.isArray(filteredVendor)
    ? filteredVendor.slice(
        (currentModal - 1) * itemsPerPageModal,
        currentModal * itemsPerPageModal
      )
    : [];
  const openModal = (id_paket) => {
    console.log("Membuka modal untuk ID Paket:", id_paket);
    fetchVendor(id_paket);
    setIsModalOpen(true);
  };

  const openGenerateLinkModal = async (shortlist_id) => {
    console.log("Vendor data received:", shortlist_id);

    if (!shortlist_id) {
      alert("ID Shortlist tidak ditemukan.");
      console.error("Shortlist ID is null or undefined");
      return;
    }

    try {
      console.log("Fetching link for shortlist_id:", shortlist_id);
      const urlResult = await fetchGenerateLink(shortlist_id);

      if (urlResult) {
        console.log("URL Kuisioner berhasil didapatkan:", urlResult);
        const token = urlResult.split("token=")[1];
        const newLink = `http://localhost:3000/pengumpulan_data/survei_kuesioner/${token}`;

        console.log(newLink);
        setUrlKuisionerResult(newLink);
      } else {
        alert("Gagal mendapatkan link kuisioner. Silakan coba lagi.");
        console.error("URL Kuisioner tidak ditemukan atau gagal diproses.");
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat membuka modal:", error.message);
    } finally {
      setIsGenerateLinkModalOpen(true);
      console.log("Generate Link Modal dibuka.");
    }
  };

  const closeGenerateLinkModal = () => {
    // setSelectedVendor(null);
    setIsGenerateLinkModalOpen(false);
  };
  useEffect(() => {
    if (isModalOpen) {
      setActiveMenu(null);
    }
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveVendorMenu(null);
  };

  return (
    <div className="p-8">
      <Navbar />
      <div className="space-y-3 pt-8">
        <h3 className="text-H3 text-emphasis-on_surface-high">
          Informasi Tahapan Pengumpulan Data
        </h3>
        <div className="rounded-[16px] border border-surface-light-outline overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-auto w-full min-w-max">
              <thead>
                <tr className="bg-custom-blue-100 text-left text-emphasis-on_surface-high uppercase tracking-wider">
                  <th className="px-3 py-6 text-sm text-center w-[52px]">No</th>
                  <th className="px-3 py-6 text-sm w-[280px]">Nama Paket</th>
                  <th className="px-3 py-6 text-sm w-[200px]">Nama PPK</th>
                  <th className="px-3 py-6 text-sm w-[200px]">Jabatan PPK</th>
                  <th className="px-3 py-6 text-sm w-[140px]">Kode Rup</th>
                  <th className="px-3 py-6 text-sm w-[280px]">Status</th>
                  <th className="px-3 py-6 text-sm w-[52px] text-center relative">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`${
                      index % 2 === 0
                        ? "bg-custom-neutral-0"
                        : "bg-custom-neutral-100"
                    }`}
                  >
                    <td className="px-3 py-6 text-sm text-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-3 py-6 text-sm">{item.nama_paket}</td>
                    <td className="px-3 py-6 text-sm">{item.nama_ppk}</td>
                    <td className="px-3 py-6 text-sm">{item.jabatan_ppk}</td>
                    <td className="px-3 py-6 text-sm">{item.kode_rup}</td>
                    <td className="px-3 py-6 text-sm">{item.status}</td>
                    <td className="px-3 py-6 text-sm relative">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-colors 
                          hover:bg-custom-blue-50 cursor-pointer`}
                          onClick={(e) => handleToggleMenu(item.id, e)}
                        >
                          <More
                            size="24"
                            color={colors.Emphasis.Light.On_Surface.High}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalData={status_pemeriksaan_data.length}
        onPageChange={setCurrentPage}
      />

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4 content-center">
            <h5 className="text-H5">Vendor</h5>
            <button onClick={closeModal}>
              <CloseCircle size="24" />
            </button>
          </div>
          <SearchBox
            placeholder="Cari Vendor..."
            onSearch={handleSearch}
            filterOptions={filterOptions}
            withFilter={true}
            onFilterClick={(filters) => handleFilterClick(filters)}
          />
          <div className="mt-4">
            <div className="rounded-[16px] border border-surface-light-outline overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-auto w-full min-w-max">
                  <thead>
                    <tr className="bg-custom-blue-100 text-left text-emphasis-on_surface-high uppercase tracking-wider">
                      <th className="px-3 py-6 text-sm text-left w-[492px]">
                        Responden/Vendor
                      </th>
                      <th className="px-3 py-6 text-sm text-left w-[220px]">
                        Pemilik Vendor
                      </th>
                      <th className="px-3 py-6 text-sm text-left w-[340px]">
                        Alamat
                      </th>
                      <th className="px-3 py-6 text-sm text-center w-[52px]">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendor && Array.isArray(vendor) && vendor.length > 0 ? (
                      paginatedVendor.map((item, index) => (
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0
                              ? "bg-custom-neutral-0"
                              : "bg-custom-neutral-100"
                          }`}
                        >
                          <td className="px-3 py-6 text-sm">
                            {item.nama_vendor}
                          </td>
                          <td className="px-3 py-6 text-sm">{item.pic}</td>
                          <td className="px-3 py-6 text-sm">
                            {item.alamat_vendor}
                          </td>
                          <td className="px-3 py-6 justify-center content-center">
                            <button
                              className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-colors 
                            hover:bg-custom-blue-50 cursor-pointer`}
                              onClick={(e) =>
                                handleToggleVendorMenu(item.shortlist_id, e)
                              }
                            >
                              <More
                                size="24"
                                color={colors.Emphasis.Light.On_Surface.High}
                              />
                            </button>
                            {activeVendorMenu === item.shortlist_id && (
                              <div
                                className="absolute bg-white rounded-[12px] mr-[12px] shadow-lg p-2 w-56"
                                style={{
                                  left: "705px",
                                  right: menuPosition.alignRight
                                    ? 0
                                    : undefined,
                                  zIndex: 10000,
                                  boxShadow:
                                    "0px 4px 16px 0px rgba(165, 163, 174, 0.45)",
                                }}
                              >
                                <Link
                                  href="#"
                                  className="block px-4 py-2 text-sm text-emphasis-on_surface-high hover:bg-custom-blue-50 rounded-[12px] transition-all duration-200"
                                  onClick={() =>
                                    handleLinkClick(item.shortlist_id)
                                  }
                                >
                                  Lihat PDF Kuesioner
                                </Link>
                                <Link
                                  href={`/pemeriksaan_data/data_detail/${item.shortlist_id}`}
                                  onClick={() => {
                                    localStorage.setItem(
                                      "shortlist_id",
                                      item.shortlist_id
                                    );
                                    console.log(
                                      "shortlist_id disimpan:",
                                      item.shortlist_id
                                    );
                                  }}
                                  className="block px-4 py-2 text-sm text-emphasis-on_surface-high hover:bg-custom-blue-50 rounded-[12px] transition-all duration-200"
                                >
                                  Periksa Data
                                </Link>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="px-3 py-6 text-B1 text-center text-emphasis-on_surface-medium"
                          colSpan="4"
                        >
                          Tidak ada data tersedia
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {vendor && vendor.length > 0 && (
              <Pagination
                currentPage={currentModal}
                itemsPerPage={itemsPerPageModal}
                totalData={filteredVendor.length}
                onPageChange={setCurrentModal}
              />
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Baru */}
      <Modal isOpen={isGenerateLinkModalOpen} onClose={closeGenerateLinkModal}>
        <div className="p-3 space-y-3">
          <div className="flex justify-between items-center content-center">
            <h5 className="text-H5 mb-4">Link Kuesioner</h5>
            <button onClick={closeGenerateLinkModal}>
              <CloseCircle size="24" />
            </button>
          </div>
          <div className="flex items-end gap-4">
            <TextInput
              label="Link"
              labelPosition="top"
              placeholder="Link tidak ditemukan"
              size="Medium"
              value={urlKuisionerResult}
              labelWidth="100px"
              disabledActive={true}
              className="flex-1"
            />
            <button
              className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-colors 
      hover:bg-custom-blue-50 cursor-pointer border-2 border-surface-light-outline outline-none focus:outline-custom-blue-500`}
              onClick={() => {
                navigator.clipboard
                  .writeText(urlKuisionerResult)
                  .then(() => {
                    alert("Link berhasil disalin ke clipboard!");
                  })
                  .catch(() => {
                    alert("Gagal menyalin link.");
                  });
              }}
            >
              <ClipboardText
                size="24"
                color={colors.Emphasis.Light.On_Surface.High}
              />
            </button>
          </div>
          <div className="flex justify-end gap-4">
            <Button
              variant="solid_blue"
              size="Medium"
              onClick={closeGenerateLinkModal}
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>

      {activeMenu && (
        <div
          className="absolute bg-white rounded-[12px] mr-[12px] shadow-lg p-2 w-56"
          style={{
            top: menuPosition.top,
            left: menuPosition.alignRight ? undefined : menuPosition.left,
            right: menuPosition.alignRight ? 0 : undefined,
            zIndex: 10000,
            boxShadow: "0px 4px 16px 0px rgba(165, 163, 174, 0.45)",
          }}
        >
          <Link
            href="#"
            className="block px-4 py-2 text-sm text-emphasis-on_surface-high hover:bg-custom-blue-50 rounded-[12px] transition-all duration-200"
            onClick={() => openModal(activeMenu)}
          >
            Lihat Detail Kuesioner
          </Link>
        </div>
      )}
    </div>
  );
}
