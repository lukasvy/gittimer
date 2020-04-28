const expect = require('chai').expect;

describe('Test date time service formatting of time', () => {
   it('Should display proper time', ()=>{
       const {humanReadableSeconds} = require('~/src/services/DateTimeService');

       expect(humanReadableSeconds(3000, true), '3000 seconds to be 50 m').to.be.equal('50 m');

       expect(humanReadableSeconds(3000), '3000 seconds to be 50 minutes').to.be.equal('50 minutes');

       expect(humanReadableSeconds(3023, true), '3023 seconds to be 50 m 23 s').to.be.equal('50 m 23 s');
       expect(humanReadableSeconds(3023), '3023 seconds to be 50 minutes 23 seconds').to.be.equal('50 minutes 23 seconds');

       expect(humanReadableSeconds(3001, true), '3001 seconds to be 50 m 1 s').to.be.equal('50 m 1 s');
       expect(humanReadableSeconds(3001), '3001 seconds to be 50 minutes 1 second').to.be.equal('50 minutes 1 second');

       expect(humanReadableSeconds(34000), '34000 seconds to be 9 hours 26 minutes 40 seconds').to.be.equal('9 hours 26 minutes 40 seconds');

       expect(humanReadableSeconds(340000), '340000 seconds to be 3 days 22 hours 26 minutes 40 seconds').to.be.equal('3 days 22 hours 26 minutes 40 seconds');

       expect(humanReadableSeconds(340000, true), '340000 seconds to be 3 d 22 h 26 m 40 s').to.be.equal('3 d 22 h 26 m 40 s');

       expect(humanReadableSeconds(3400000), '3400000 seconds to be 39 days 8 hours 26 minutes 40 seconds').to.be.equal('39 days 8 hours 26 minutes 40 seconds');

       expect(humanReadableSeconds(34000000), '34000000 seconds to be 1 year 28 days 12 hours 26 minutes 40 seconds').to.be.equal('1 year 28 days 12 hours 26 minutes 40 seconds');
   });
});