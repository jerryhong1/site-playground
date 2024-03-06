const nameDiv = document.getElementById('names')
const linksDiv = document.getElementById('links')

// note to self: move these lists to an airtable/spreadsheet :)
// NAMES
const NAMES = 
[
  {
    name: 'Betty Wang',
    link: 'https://bettywang.studio/'
  },
  {
    name: 'Oscar Dumlao',
    link: 'https://www.oscardumlao.com/'
  },
  {
    name: 'Patrick Fenton',
    comment: 'ME 125 king',
  },
  {
    name: 'David Kelley'
  },
  {
    name: 'Joseph Zhang',
    link: 'https://www.josephz.me/'
  },
  {
    name: 'My Family ♥︎',
    comment: 'love you',
  },
  {
    name: 'Chris Beiser',
    link: 'http://whydontyoulove.me/'
  },
  {
    name: "Max Krieger",
    link: 'https://a9.io/',
    comment: 'he tools-for-thought-pilled me'
  },
  {
    name: "Prabhas Pokharel"
  },
  {
    name: "Robert Ochshorn",
    link: 'https://rmozone.com/'
  },
  {
    name: "Bella You"
  },
  {
    name: "Yixiao Liu",
    link: "https://twofourone.net/"
  },
  {
    name: "Mika Isayama"
  },
  {
    name: "Kathleen Yang"
  },
  {
    name: "Melinda Wang"
  },
  {
    name: "Ryan Tolsma",
    link: "https://www.ryantolsma.com/"
  },
  {
    name: "Annie Chen",
    link: "https://anniesch.github.io/"
  },
  {
    name: "Joel Lewenstein",
    link: "https://joellewenstein.com/",
    comment: 'this man saved my design career!'
  },
  {
    name: "Ranjay Krishna",
    link: "https://ranjaykrishna.com/"
  },
  {
    name: "Zixian Ma",
    link: "https://zixianma.github.io/"
  },
  {
    name: "Mustafa Omer Gul",
    link: "https://momergul.github.io/"
  },
  {
    name: "Tai Nguyen"
  },
  {
    name: "Tyler Packard"
  },
  {
    name: "Zoe Ong"
  },
  {
    name: "Sandra Kong"
  },
  {
    name: "Daniel Li"
  },
  {
    name: "Mei-Lan Steimle"
  },
  {
    name: "Xander Koo",
    link: "https://xanderk.ooo/"
  },
  {
    name: "Lucy Huo"
  },
  {
    name: "Abhay Agarwal",
    comment: 'let\'s go Polytopal'
  },
  {
    name: "Audrey Gu",
    link: "https://audreygu.io/"
  },
  {
    name: "Chad Thornton"
  },
  {
    name: "Abby Taylor"
  },
  {
    name: "Jodie Bhattacharya"
  },
  {
    name: "Jesse Doan",
    link: "https://jesseqd.github.io/"
  },
  {
    name: "Josh Dong"
  },
  {
    name: "Anthony Chen"
  },
  {
    name: "Nathan Lee"
  },
  {
    name: "Christine Liu"
  },
  {
    name: "Lily Liu"
  },
  {
    name: "Justin Liu",
    link: "https://jliu.cc/"
  },
  {
    name: "Krain Chen",
    link: "https://stanford.edu/~krainc/index.html"
  }
]

// sort by last name?
NAMES.sort((a, b) => {
  // let x = a.name(); let y = b.name;
  let x = a.name.split(" "); let y = b.name.split(" ");
  x = x[x.length - 1] ; y = y[y.length - 1];
  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
})

// populate names
let nameHTML = ""
NAMES.forEach((name, index) => {
  if (name.link !== undefined) {
    nameHTML += `<a href=${name.link} target="_blank" rel="noreferrer noopener">`
  } else {
    nameHTML += `<span ${name.comment ? `title="${name.comment}` : ""}">`
  }

  nameHTML += name.name;
  if (name.link !== undefined) {
    nameHTML += `</a>`
  } else {
    nameHTML += `</span>`
  }
  
  if (index < NAMES.length -1) {
    nameHTML += " • ";
  }
})

nameDiv.innerHTML = nameHTML




// LINKS
const FEATURED_LINKS = 
[
  {
    title: "Eigenquestions",
    link: "https://coda.io/@shishir/eigenquestions-the-art-of-framing-problems"
  },
  {
    title: "Lingua Franca",
    link: "https://linguafranca.polytopal.ai/"
  },
  {
    title: "A Big Little Idea Called Legibility",
    link: "https://www.ribbonfarm.com/2010/07/26/a-big-little-idea-called-legibility"
  },
  {
    title: "Designing Fluid Interfaces",
    link: "https://developer.apple.com/videos/play/wwdc2018/803"
  },
  {
    title: "You and Your Research",
    link: "https://d37ugbyn3rpeym.cloudfront.net/stripe-press/TAODSAE_zine_press.pdf"
  },
  {
    title: "The Hidden Melodies of Subways around the World",
    link: "https://www.nytimes.com/interactive/2021/08/13/arts/subway-train-sounds.html"
  },
  {
    title: "See, Think, Design, Produce",
    link: "http://style.org/stdp3/"
  },
  {
    title: "On Ceilings",
    link: "https://chias.blog/2022/ceilings/"
  },
  {
    title: "Delight and Accommodation",
    link: "https://shapeofdesignbook.com/chapters/09-delight-and-accommodation/"
  },
  {
    title: "Obituary: Maureen Brennan Weaver",
    link: "https://www.legacy.com/us/obituaries/legacyremembers/maureen-brennan-weaver-obituary?id=35333333"
  },
  {
    title: "Shame Storm",
    link: "https://www.firstthings.com/article/2019/01/shame-storm"
  },
  {
    title: "Ladder of Abstraction",
    link: "http://worrydream.com/#!2/LadderOfAbstraction"
  },
  {
    title: "Build Cities for People, Not Cars",
    link: "https://devonzuegel.com/post/we-should-be-building-cities-for-people-not-cars"
  },
  {
    title: "Postmortem: Every Frame a Painting",
    link: "https://medium.com/@tonyszhou/postmortem-1b338537fabc"
  },
  {
    title: "Ranking SNL Cast Members As Presidents",
    link: "https://justinmcelroy.com/2015/02/15/ranking-every-snl-cast-member-using-math-and-presidents/"
  },
  {
    title: "The Cube Rule",
    link: "https://cuberule.com/"
  },
  {
    title: "Napkin",
    link: "https://web.evanchen.cc/napkin.html"
  },
  {
    title: "The Cab Ride I'll Never Forget",
    link: "https://kentnerburn.com/the-cab-ride-ill-never-forget/"
  },
  {
    title: "In Defense of Design Thinking, Which Is Terrible",
    link: "https://www.subtraction.com/2018/04/02/in-defense-of-design-thinking-which-is-terrible/"
  },
  {
    title: "The Emergence of Random Structure",
    link: "https://www.quantamagazine.org/elegant-six-page-proof-reveals-the-emergence-of-random-structure-20220425/"
  },
  {
    title: "The Weight of Glory",
    link: "https://www.wheelersburg.net/Downloads/Lewis%20Glory.pdf"
  }
]

// populate links
let linkHTML = ""
FEATURED_LINKS.forEach((link, index) => {
  linkHTML += `<a href="${link.link}" target="_blank" rel="noreferrer noopener">${link.title}</a>`
  if (index < FEATURED_LINKS.length - 1) {
    linkHTML += " • "
  }
})
linksDiv.innerHTML = linkHTML;