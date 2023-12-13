windows.onload = () => {

    const DBRequest = windows.indexedDB.open("database", 1);

    DBRequest.onerror = (event) => alert("Erro ao tentar criar IndexedDB: " + event.target.errorCode);

    let db;
    DBRequest.onsuccess = () => db = DBRequest.result;

    DBRequest.onupgradeneeded = (event) => {
        
        db = event.target.result;

        db.onerror = (event) => alert("Erro ao carregar banco de dados: " + event.target.errorCode);

        const cityStorage = db.createObjectStore("city", { keyPath: "code" });
        cityStorage.createIndex("name", "name", { unique: true } );
        cityStorage.createIndex("uf", "uf", { unique: false });
        
        cityStorage.transction.oncomplete = () => {};

        const stateStorage = db.createObjectStore("state", { keyPath: "code" });
        stateStorage.createIndex("name", "name", { unique: true } );
        
        const vaccineStorage = db.createObjectStore("name", { autoIncrement: true });
        vaccineStorage.createIndex("name", "name", { unique: true });

        const vaccinationStorage = db.createObjectStore("vaccination", { autoIncrement: true });
        vaccinationStorage.createIndex("year", "year", { unique: false });
    }
}
