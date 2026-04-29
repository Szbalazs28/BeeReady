// Mock-oljuk az adatbázis hívásokat
jest.mock('./sql/querys.js', () => ({
    save_result: jest.fn(),
    userexists: jest.fn(),
    userbyemail: jest.fn(),
    userbyid: jest.fn(),
    loadanswers: jest.fn(),
}));

const {
    passwordTest,
    emailTest,
    admincheck,
    affectedRowscheck,
    lengthtest,
    timetest,
    getuserbyemail,
    getuserbyid,
    checkuserexists,
    compare,
    encrypt,
} = require('./data_test.js');

const { isexistscheck, share_code_generator } = require('./utils.js');
const { userexists, userbyemail, userbyid } = require('./sql/querys.js');


// passwordTest

describe('passwordTest', () => {
    test('érvényes jelszót elfogad', () => {
        expect(() => passwordTest('Jelszo1!')).not.toThrow();
    });

    test('hibát dob ha rövidebb mint 6 karakter', () => {
        expect(() => passwordTest('Ab1!')).toThrow('Legalább 6 karakternek kell lennie!');
    });

    test('hibát dob ha nincs nagybetű', () => {
        expect(() => passwordTest('jelszo1!')).toThrow('Kell tartalmaznia nagybetűt!');
    });

    test('hibát dob ha nincs speciális karakter', () => {
        expect(() => passwordTest('Jelszo1')).toThrow('Kell tartalmaznia legalább egy speciális karaktert!');
    });

    test('hibát dob ha nincs szám', () => {
        expect(() => passwordTest('Jelszo!')).toThrow('Kell tartalmaznia legalább egy számot!');
    });

    test('400-as státuszkódot ad vissza hiba esetén', () => {
        try {
            passwordTest('gyenge');
        } catch (err) {
            expect(err.status).toBe(400);
        }
    });

    test('több hibát is felsorol egyszerre', () => {
        try {
            passwordTest('abc');
        } catch (err) {
            expect(err.message).toMatch('Legalább 6 karakternek kell lennie!');
            expect(err.message).toMatch('Kell tartalmaznia nagybetűt!');
            expect(err.message).toMatch('Kell tartalmaznia legalább egy speciális karaktert!');
            expect(err.message).toMatch('Kell tartalmaznia legalább egy számot!');
        }
    });
});


// emailTest

describe('emailTest', () => {
    test('érvényes email-t elfogad', () => {
        expect(() => emailTest('teszt@example.com')).not.toThrow();
        expect(() => emailTest('user.name+tag@domain.hu')).not.toThrow();
    });

    test('hibát dob @ nélkül', () => {
        expect(() => emailTest('nemvalidemail')).toThrow('Hibás E-mail cím formátum!');
    });

    test('hibát dob domain nélkül', () => {
        expect(() => emailTest('teszt@')).toThrow('Hibás E-mail cím formátum!');
    });

    test('hibát dob TLD nélkül', () => {
        expect(() => emailTest('teszt@domain')).toThrow('Hibás E-mail cím formátum!');
    });

    test('400-as státuszkódot ad vissza', () => {
        try {
            emailTest('rossz');
        } catch (err) {
            expect(err.status).toBe(400);
        }
    });
});


// admincheck

describe('admincheck', () => {
    test('nem dob hibát ha van elem a tömbben', () => {
        expect(() => admincheck([{ id: 1 }])).not.toThrow();
    });

    test('hibát dob ha üres a tömb', () => {
        expect(() => admincheck([])).toThrow('Nincs jogosultságod!');
    });

    test('403-as státuszkódot ad vissza', () => {
        try {
            admincheck([]);
        } catch (err) {
            expect(err.status).toBe(403);
        }
    });
});


// affectedRowscheck

describe('affectedRowscheck', () => {
    test('nem dob hibát ha érintett sorok száma > 0', () => {
        expect(() => affectedRowscheck({ affectedRows: 1 })).not.toThrow();
        expect(() => affectedRowscheck({ affectedRows: 5 })).not.toThrow();
    });

    test('hibát dob ha affectedRows === 0', () => {
        expect(() => affectedRowscheck({ affectedRows: 0 })).toThrow('Nem sikerült az adatok módosítása!');
    });
});


// lengthtest

describe('lengthtest', () => {
    test('elfogadja a határon belüli értéket', () => {
        expect(() => lengthtest('abc', 2, 5)).not.toThrow();
        expect(() => lengthtest('ab', 2, 5)).not.toThrow();
        expect(() => lengthtest('abcde', 2, 5)).not.toThrow();
    });

    test('hibát dob ha rövidebb mint min', () => {
        expect(() => lengthtest('a', 2, 5)).toThrow('A hossznak 2 és 5 karakter között kell lennie!');
    });

    test('hibát dob ha hosszabb mint max', () => {
        expect(() => lengthtest('abcdef', 2, 5)).toThrow('A hossznak 2 és 5 karakter között kell lennie!');
    });

    test('400-as státuszkódot ad vissza', () => {
        try {
            lengthtest('x', 3, 10);
        } catch (err) {
            expect(err.status).toBe(400);
        }
    });
});


// timetest

describe('timetest', () => {
    test('elfogad érvényes időpontokat', () => {
        expect(() => timetest('08:00', '16:00')).not.toThrow();
        expect(() => timetest('00:00', '23:59')).not.toThrow();
    });

    test('hibát dob ha start >= end', () => {
        expect(() => timetest('16:00', '08:00')).toThrow('A kezdési időpontnak kisebbnek kell lennie');
        expect(() => timetest('10:00', '10:00')).toThrow('A kezdési időpontnak kisebbnek kell lennie');
    });

    test('hibát dob rossz formátum esetén', () => {
        expect(() => timetest('800', '1600')).toThrow('Az időpontnak HH:MM formátumúnak kell lennie!');
        expect(() => timetest('', '')).toThrow('Az időpontnak HH:MM formátumúnak kell lennie!');
    });
});


// getuserbyemail

describe('getuserbyemail', () => {
    test('visszaadja a sort ha létezik a felhasználó', async () => {
        const mockUser = [{ id: 1, email: 'teszt@example.com' }];
        userbyemail.mockResolvedValue([mockUser]);

        const result = await getuserbyemail('teszt@example.com');
        expect(result).toEqual(mockUser);
    });

    test('hibát dob ha nem található az email', async () => {
        userbyemail.mockResolvedValue([[]]);

        await expect(getuserbyemail('nemletezik@example.com'))
            .rejects.toThrow('Nem található E-mail cím!');
    });

    test('409-es státuszkódot ad vissza', async () => {
        userbyemail.mockResolvedValue([[]]);

        try {
            await getuserbyemail('nemletezik@example.com');
        } catch (err) {
            expect(err.status).toBe(409);
        }
    });
});


// getuserbyid

describe('getuserbyid', () => {
    test('visszaadja a sort ha létezik a felhasználó', async () => {
        const mockUser = [{ id: 42, username: 'teszter' }];
        userbyid.mockResolvedValue([mockUser]);

        const result = await getuserbyid(42);
        expect(result).toEqual(mockUser);
    });

    test('hibát dob ha nem található az id', async () => {
        userbyid.mockResolvedValue([[]]);

        await expect(getuserbyid(999))
            .rejects.toThrow('Nem található a felhasználó!');
    });
});


// checkuserexists

describe('checkuserexists', () => {
    test('nem dob hibát ha nem létezik a felhasználó', async () => {
        userexists.mockResolvedValue([[]]);

        await expect(checkuserexists('uj@example.com', 'ujfelhasznalo')).resolves.not.toThrow();
    });

    test('hibát dob ha már létezik', async () => {
        userexists.mockResolvedValue([[{ id: 1 }]]);

        await expect(checkuserexists('letezik@example.com', 'letezik'))
            .rejects.toThrow('Ilyen E-mail cím vagy Felhasználónév már létezik!');
    });

    test('409-es státuszkódot ad vissza', async () => {
        userexists.mockResolvedValue([[{ id: 1 }]]);

        try {
            await checkuserexists('letezik@example.com', 'letezik');
        } catch (err) {
            expect(err.status).toBe(409);
        }
    });
});


// encrypt & compare

describe('encrypt és compare', () => {
    test('a hashelt jelszó különbözik az eredetitől', async () => {
        const hash = await encrypt('Jelszo1!');
        expect(hash).not.toBe('Jelszo1!');
        expect(hash).toMatch(/^\$2b\$/); // bcrypt hash formátum
    });

    test('helyes jelszóval nem dob hibát a compare', async () => {
        const hash = await encrypt('Jelszo1!');
        await expect(compare('Jelszo1!', hash)).resolves.not.toThrow();
    });

    test('rossz jelszóval hibát dob a compare', async () => {
        const hash = await encrypt('Jelszo1!');
        await expect(compare('RosszJelszo1!', hash)).rejects.toThrow('Hibás jelszó!');
    });

    test('a compare 403-as státuszkódot ad vissza', async () => {
        const hash = await encrypt('Jelszo1!');
        try {
            await compare('Rossz1!', hash);
        } catch (err) {
            expect(err.status).toBe(403);
        }
    });
});


// isexistscheck (utils.js)

describe('isexistscheck', () => {
    test('mode=true: hibát dob ha már létezik (rows.length > 0)', () => {
        expect(() => isexistscheck([{ id: 1 }], 'Teszt', true))
            .toThrow('"Teszt" már létezik!');
    });

    test('mode=true: nem dob hibát ha nem létezik (rows üres)', () => {
        expect(() => isexistscheck([], 'Teszt', true)).not.toThrow();
    });

    test('mode=false: hibát dob ha nem található (rows üres)', () => {
        expect(() => isexistscheck([], 'Teszt', false))
            .toThrow('"Teszt" nem található!');
    });

    test('mode=false: nem dob hibát ha megtalálható', () => {
        expect(() => isexistscheck([{ id: 1 }], 'Teszt', false)).not.toThrow();
    });

    test('409-es státuszkódot ad vissza mindkét esetben', () => {
        try { isexistscheck([{ id: 1 }], 'X', true); } catch (err) {
            expect(err.status).toBe(409);
        }
        try { isexistscheck([], 'X', false); } catch (err) {
            expect(err.status).toBe(409);
        }
    });
});


// share_code_generator (utils.js)

describe('share_code_generator', () => {
    test('visszaad egy stringet', () => {
        expect(typeof share_code_generator()).toBe('string');
    });

    test('minden hívás más értéket ad', () => {
        const code1 = share_code_generator();
        const code2 = share_code_generator();
        expect(code1).not.toBe(code2);
    });

    test('csak base64url karaktereket tartalmaz', () => {
        const code = share_code_generator();
        expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    });
});
