API_URL = "https://69c50a5f8a5b6e2dec2bb16e.mockapi.io/transactions"
const tabel = document.querySelector(".table-data")
const loading = document.getElementById("loading")
const kumpulModal = document.getElementById("kumpulan-modal")
const textSaldo = document.getElementById("text-saldo")
const textIncome = document.getElementById("text-income")
const textExpense = document.getElementById("text-expense")
let myChart
const home = document.getElementById("dashboard")

const calendarDashboard = flatpickr("#kalender-home", {
    mode: "range",
    inline: true,
    dateFormat: "Y-m-d",
    onChange: function (selectedDates) {
        if (selectedDates) {
            dateCart(selectedDates)
        }
    }
})

async function dateCart(rangeDate) {
    home.classList.add("opacity-50")
    try {
        const response = await fetch(API_URL)
        const data = await response.json()

        const awalDate = rangeDate[0]
        const akhirDate = rangeDate[1]

        const dataFilter = data.filter(items => {
            const tgl = new Date(items.date)
            return tgl >= awalDate && tgl <= akhirDate
        })
        let inc = 0
        let exp = 0
        dataFilter.forEach(items => {
            if (items.type === "income") {
                inc += Number(items.amount)
            } else if (items.type === "expense") {
                exp += Number(items.amount)
            }
        })
        tampilChart(inc, exp)
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Gagal",
            text: `Gagal ${error}`,
            timer: 2000,
            showConfirmButton: false
        })
    } finally {
        home.classList.remove("opacity-50")
    }
}

async function dashboard() {
    home.classList.add("opacity-50")
    try {
        const response = await fetch(API_URL)
        const data = await response.json()
        let saldo = 0
        let income = 0
        let expense = 0
        data.forEach((items, index) => {
            saldo += items.amount
            if (items.type === "income") {
                income += items.amount
            } else if (items.type === "expense") {
                expense += items.amount
            }
        })
        tampilChart(income, expense)
        textSaldo.innerText = `Rp. ${Math.abs(saldo).toLocaleString("id-ID")}`
        textIncome.innerText = `Rp. ${Math.abs(income).toLocaleString("id-ID")}`
        textExpense.innerText = `Rp. ${Math.abs(expense).toLocaleString("id-ID")}`

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Gagal",
            text: `Gagal Memuat ${error}`,
            timer: 2000,
            showConfirmButton: false
        })
    } finally {
        home.classList.remove("opacity-50")
    }
}

dashboard()

function tampilChart(pemasukan, pengeluaran) {
    const canvas = document.getElementById('myChart');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ["Pemasukan", "Pengeluaran"],
            datasets: [{
                label: 'Total Rp.',
                data: [pemasukan, pengeluaran],
                backgroundColor: ['#198754', '#dc3545'],
                borderWidth: 1,
                hoverOffset: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function formatTanggal(tanggal) {
    const opsi = { year: "numeric", month: "long", day: "numeric" }
    return new Date(tanggal).toLocaleDateString("id-ID", opsi)
}

async function cariData() {
    const keyword = document.getElementById("cari").value.toLowerCase()
    try {
        loading.classList.add("d-block")
        tabel.classList.add("opacity-50")
        const response = await fetch(API_URL)
        const data = await response.json()
        const dataFilter = data.filter(items => {
            return items.text.toLowerCase().includes(keyword) ||
                items.note.toLowerCase().includes(keyword)
        })
        tampil(dataFilter);
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Gagal",
            text: `Gagal ${error}`,
            timer: 2000,
            showConfirmButton: false
        })
    } finally {
        loading.classList.remove("d-block")
        loading.classList.add("d-none")
        tabel.classList.remove("opacity-50")
    }
}

async function awalTampil() {
    loading.classList.add("d-block")
    tabel.classList.add("opacity-50")
    try {
        const response = await fetch(API_URL)
        const data = await response.json()

        tampil(data);
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Gagal",
            text: `Transaksi Gagal Disimpan ${error}`,
            timer: 2000,
            showConfirmButton: false
        })
    } finally {
        loading.classList.remove("d-block")
        loading.classList.add("d-none")
        tabel.classList.remove("opacity-50")
    }
}

awalTampil()

async function tampil(data) {
    kumpulModal.innerHTML = ""
    tabel.innerHTML = ""
    data.forEach((items, index) => {
        let baris = document.createElement("tr")
        baris.innerHTML = `
            <td class="px-1">${index + 1}</td>
            <td class="px-1">${items.text}</td>
            <td class="${items.type === "expense" ? "text-danger" : "text-success"} px-1">
                ${items.type === "expense" ? "-" : "+"} Rp. ${Math.abs(items.amount).toLocaleString("id-ID")}
            </td>
            <td class="px-1">${formatTanggal(items.date)}</td>
            <td class="p-2">
                <button class="btn btn-primary my-md-0 my-1" data-bs-toggle="modal" data-bs-target="#modalDetail${items.id}">Detail</button>
                <button class="btn btn-success my-md-0 my-1" data-bs-toggle="modal" data-bs-target="#modalEdit${items.id}">Edit</button>
                <button class="btn btn-danger my-md-0 my-1" onclick="hapus('${items.id}')">Hapus</button>
            </td>
            `

        let modal = document.createElement("div")
        modal.innerHTML = `
            <div class="modal fade" id="modalDetail${items.id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="exampleModalLabel">Detail Keuangan</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><b>Id : </b>${items.id}</li>
                            <li class="list-group-item"><b>Deskripsi : </b>${items.text}</li>
                            <li class="list-group-item"><b>Nominal : </b> <span class="${items.type === "expense" ? "text-danger" : "text-success"}">${items.type === "expense" ? "-" : "+"} Rp. ${Math.abs(items.amount).toLocaleString("id-ID")}</span></li>
                            <li class="list-group-item"><b>Kategori : </b>${items.category}</li>
                            <li class="list-group-item"><b>Tipe : </b>${items.type}</li>
                            <li class="list-group-item"><b>Tanggal : </b>${formatTanggal(items.date)}</li>
                            <li class="list-group-item"><b>Keterangan : </b>${items.note}</li>
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="modalEdit${items.id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="form-edit${items.id} modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="exampleModalLabel">Tambah Data</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-outline">
                                <label for="" class="form-label">Deskripsi</label>
                                <input type="text" class="form-control deskripsi" value="${items.text}">
                            </div>
                            <div class="form-outline">
                                <label for="" class="form-label">Nominal</label>
                                <input type="number" class="form-control nominal" value="${items.amount}">
                            </div>
                            <div class="form-outline">
                                <label for="" class="form-label">Kategori</label>
                                <select class="form-select kategori text-capitalize" id="">
                                    <option value="${items.category}">${items.category}</option>
                                    <option value="gaji">Gaji</option>
                                    <option value="hadiah">Hadiah</option>
                                    <option value="belanja">Belanja</option>
                                    <option value="transport">Transport</option>
                                    <option value="makan">Makan</option>
                                    <option value="jajan">Jajan</option>
                                    <option value="cicilan">Cicilan</option>
                                </select>
                            </div>
                            <div class="form-outline">
                                <label for="" class="form-label">Tipe</label>
                                <div class="form-control">
                                    <input type="radio" name="tipe${items.id}" ${items.type === "income" ? "checked" : ""} value="income" id="pemasukan${items.id}"> <label
                                        for="pemasukan${items.id}">Pemasukan</label>
                                    <input type="radio" ${items.type === "expense" ? "checked" : ""} name="tipe${items.id}" value="expense" id="pengeluaran${items.id}"> <label
                                        for="pengeluaran${items.id}">Pengeluaran</label>
                                </div>
                            </div>
                            <div class="form-outline">
                                <label for="" class="form-label">Tanggal</label>
                                <input type="date" class="form-control tanggal" value="${items.date}" id="">
                            </div>
                            <div class="form-outline">
                                <label for="" class="form-label">Keterangan</label>
                                <textarea class="keterangan form-control">${items.note}</textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                            <button type="submit" class="btn btn-success" onclick="updateData(event, ${items.id})" >Edit</button>
                        </div>
                    </div>
                </div>
            </div>
            `
        tabel.appendChild(baris)
        kumpulModal.appendChild(modal)
    }
    );
}

const formTambah = document.getElementById("form-tambah")
formTambah.addEventListener("submit", async function (e) {
    e.preventDefault()
    const text = document.querySelector(".deskripsi")
    const amount = document.querySelector(".nominal")
    const category = document.querySelector(".kategori")
    const date = document.querySelector(".tanggal")
    const note = document.querySelector(".keterangan")
    const type = document.querySelector("input[name='tipe']:checked").value
    const modalElemen = document.getElementById("modalTambah")
    const modal = bootstrap.Modal.getInstance(modalElemen)
    modal.hide()
    const newTransaction = {
        text: text.value,
        amount: Number(amount.value),
        category: category.value,
        type: type,
        date: date.value,
        note: note.value
    }
    Swal.fire({
        icon: "info",
        title: "Menyimpan",
        text: "Sedang Menyimpan...",
        showConfirmButton: false
    })
    try {
        console.log(newTransaction);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTransaction)
        })

        if (response.ok) {
            formTambah.reset()

            Swal.fire({
                icon: "success",
                title: "Tersimpan",
                text: "Transaksi Berhasil Disimpan",
                timer: 2000,
                showConfirmButton: false
            })
            const data = await fetch(API_URL)
            const dataa = await data.json()
            tampil(dataa)
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Gagal",
            text: "Transaksi Gagal Disimpan",
            timer: 2000,
            showConfirmButton: false
        })
    }
})

async function hapus(id) {

    console.log('button');

    const konfirmasi = await Swal.fire({
        icon: "question",
        title: "Konfirmasi",
        text: "Yakin Hapus?",
        showCancelButton: true,
        cancelButtonText: "Batal",
        confirmButtonText: "Ya, Hapus",
        confirmButtonColor: "#f73434"
    })

    try {
        if (konfirmasi.isConfirmed) {
            console.log("konfirmasi");

            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            })

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Terhapus",
                    text: "Transaksi Berhasil Dihapus",
                    showConfirmButton: false,
                    timer: 1500
                })
                const data = await fetch(API_URL)
                const dataa = await data.json()
                tampil(dataa)
            }
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Gagal",
            text: "Transaksi Gagal Dihapus",
            timer: 2000,
            showConfirmButton: false
        })
    }
}

async function updateData(e, id) {
    e.preventDefault()

    const formEdit = document.querySelector(`.form-edit${id}`)
    console.log("Berhasil");

    const text = formEdit.querySelector(".deskripsi")
    const amount = formEdit.querySelector(".nominal")
    const category = formEdit.querySelector(".kategori")
    const date = formEdit.querySelector(".tanggal")
    const note = formEdit.querySelector(".keterangan")
    const type = formEdit.querySelector(`input[name='tipe${id}']:checked`).value
    const updateTransaction = {
        text: text.value,
        amount: Number(amount.value),
        category: category.value,
        type: type,
        date: date.value,
        note: note.value
    }
    console.log(updateData);

    Swal.fire({
        icon: "info",
        title: "Menyimpan",
        text: "Sedang Menyimpan...",
        showConfirmButton: false
    })

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateTransaction)
        })

        if (response.ok) {
            const modalElemen = document.getElementById(`modalEdit${id}`)
            const modal = bootstrap.Modal.getInstance(modalElemen)
            modal.hide()
            const data = await fetch(API_URL)
            const dataa = await data.json()
            tampil(dataa)
        }
    } catch (error) {
        Swal.fire({
            title: "Gagal",
            text: "Gagal Mengubah Transaksi...",
            icon: "error",
            showConfirmButton: false,
            timer: 2000
        })
    } finally {
        await Swal.fire({
            title: "Terubah",
            text: "Transaksi Berhasil Diubah",
            icon: "success",
            showConfirmButton: false,
            timer: 1500
        })
    }
}

const calendar = flatpickr("#kalender", {
    mode: "range",
    dateFormat: "Y-m-d",
    onChange: function (selectedDates) {
        if (selectedDates.length === 2) {
            filterTanggal(selectedDates)
        }
    }
})

async function filterTanggal(rangeDate) {
    const tglAwal = rangeDate[0]
    const tglAkhir = rangeDate[1]
    try {
        loading.classList.add("d-block")
        tabel.classList.add("opacity-50")
        const response = await fetch(API_URL)
        const data = await response.json()

        const dataFilter = data.filter(items => {
            const tglData = new Date(items.date)
            return tglData >= tglAwal && tglData <= tglAkhir
        })
        tampil(dataFilter)
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Gagal",
            text: `Gagal ${error}`,
            timer: 2000,
            showConfirmButton: false
        })
    } finally {
        loading.classList.remove("d-block")
        loading.classList.add("d-none")
        tabel.classList.remove("opacity-50")
    }
}