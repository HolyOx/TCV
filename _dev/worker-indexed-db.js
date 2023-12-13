import { SOURCE } from "data/source.js";
import { REGIONS } from "data/regions.js";
import { STATES } from "data/states.js";

const DBRequest = windows.indexedDB.open("database", 1);

DBRequest.onerror = (event) => {
    postMessage({ type: "error", message: "Erro ao tentar criar IndexedDB: " + event.target.errorCode });
}

let db;

DBRequest.onsuccess = () => {
    db = DBRequest.result;
}

DBRequest.onupgradeneeded = (event) => {
    
    db = event.target.result;

    db.onerror = (event) => {
        postMessage({ type: "error", message: "Erro ao carregar banco de dados: " + event.target.errorCode });
    }

    const regionStorage = db.createObjectStore("region", { keyPath: "code" });
    regionStorage.createIndex("acron", "acron", { unique: true } );
    regionStorage.createIndex("name", "name", { unique: true } );
    
    if (regionStorage)
        REGIONS.forEach((region) => db.transaction("region", "readwrite").objectStore("region").add(region));

    const stateStorage = db.createObjectStore("state", { keyPath: "code" });
    stateStorage.createIndex("acron", "acron", { unique: true } );
    stateStorage.createIndex("name", "name", { unique: true } );

    if (stateStorage)
        STATES.forEach((state) => db.transaction("state", "readwrite").objectStore("state").add(state));

    const cityStorage = db.createObjectStore("city", { keyPath: "code" });
    cityStorage.createIndex("uf", "uf", { unique: false });
    cityStorage.createIndex("name", "name", { unique: true } );
    
    const vaccineStorage = db.createObjectStore("vaccine", { autoIncrement: true });
    vaccineStorage.createIndex("name", "name", { unique: true });
    
    const vaccinationStorage = db.createObjectStore("vaccination", { autoIncrement: true });
    vaccinationStorage.createIndex("year", "year", { unique: false });
    
    var query, request;

    for (var i = 0; i < SOURCE.length; i++) {
        
        if (cityStorage && vaccineStorage && vaccinationStorage) {
            
            query = db.transaction("city", "readwrite").objectStore("city");
            request = query.index("code").get(SOURCE[i]["Codigo"]);
            
            request.onerror = (e) => {
                
                query.add({
                    code: SOURCE[i]["Codigo"],
                    uf: parseInt(String(SOURCE[i]["Codigo"]).substring(0, 2)),
                    name: SOURCE[i]["Municipio"],
                });
            };
            
            query = db.transaction("vaccination", "readwrite").objectStore("vaccination");
            request = query.index("name").get();
        }
    }
}