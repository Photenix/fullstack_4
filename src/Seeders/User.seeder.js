import Users from "../Models/Users"

const adminUser = async ( idRol ) => {
    const user = await Users.findOne({email: "juanmanuelpinor@gmail.com"})
    console.log("Find user")
    if( user === null ) {
        const newUser = await Users.create({
            typeIdentifier: "CC",
            username: "Cachaman",
            password: "123",
            firstName: "Juan Manuel",
            lastName: "Pinor",
            documentNumber: "2020202020",
            email: "juanmanuelpinor@gmail.com",
            birthdate: new Date("1999-10-17"),
            gender: "M",
            phone: "6543210987",
            address: "Calle 123, 456, 789",
            country: "Colombia",
            city: "Medellin",
            state: true,
            rol: idRol
        })
        await newUser.save()
        console.log("User admin created")
    }
    else {
        console.log("User admin already exists")
    }
}

const workersUsers = async ( idRol ) => {
    const userA = await Users.findOne({email: "calors@gmail.com"})
    const userB = await Users.findOne({email: "pedro.el.escamoso@gmail.com"})
    const userC = await Users.findOne({email: "angulo.el.que.te.mira.el.programa@gmail.com"})

    console.log( "Creating workers" );
    
    if(userA === null){
        const newUserA = await Users.create({
            typeIdentifier: "CC",
            username: "Calors",
            password: "123",
            firstName: "Calixto",
            lastName: "Ortiz",
            documentNumber: "2020202021",
            email: "calors@gmail.com",
            birthdate: new Date("1999-05-15"),
            gender: "M",
            phone: "6543210988",
            address: "Calle 456, 789, 1011",
            country: "Colombia",
            city: "Medellin",
            state: true,
            rol: idRol
        })
        await newUserA.save()
        console.log("User A created")
    }

    if( userB === null ){
        const newUserB = await Users.create({
            typeIdentifier: "CC",
            username: "Pedro.El.Escamoso",
            password: "123",
            firstName: "Pedro",
            lastName: "El Escamoso",
            documentNumber: "2020202022",
            email: "pedro.el.escamoso@gmail.com",
            birthdate: new Date("1999-09-20"),
            gender: "M",
            phone: "6543210989",
            address: "Calle 789, 1011, 1213",
            country: "Colombia",
            city: "Medellin",
            state: true,
            rol: idRol
        })
        await newUserB.save()
        console.log("User B created")
    }

    if( userC === null ){
        const newUserC = await Users.create({
            typeIdentifier: "CC",
            username: "Angulo.El.Que.Te.Mira.El.Programa",
            password: "123",
            firstName: "Angulo",
            lastName: "El Que Te Mira El Programa",
            documentNumber: "2020202023",
            email: "angulo.el.que.te.mira.el.programa@gmail.com",
            birthdate: new Date("1999-01-01"),
            gender: "M",
            phone: "6543210990",
            address: "Calle 1011, 1213, 1415",
            country: "Colombia",
            city: "Medellin",
            state: true,
            rol: idRol
        })
        await newUserC.save()
        console.log("User C created")
    }

    console.log("Users workers created")
}

const AnonClientUser = async ( idRol ) => {
    const userA = await Users.findOne({email: "anon@anonim.or"})

    console.log( "Creating clients" );
    
    if(userA === null){
        const newUserA = await Users.create({
            typeIdentifier: "CC",
            username: "Anonimo",
            password: "EstaContraseñanuncaseraEncontrada!#.123546489",
            firstName: "Cliente",
            lastName: "Anonimo",
            documentNumber: "00000000000",
            email: "anon@anonim.or",
            birthdate: new Date("1999-10-17"),
            gender: "M",
            phone: "0000000000",
            address: "Calle 456, 789, 1011",
            country: "Colombia",
            city: "Medellin",
            state: true,
            rol: idRol
        })
        await newUserA.save()
        console.log("User A created")
    }

    console.log("Users client created")
}

export { adminUser, workersUsers, AnonClientUser };