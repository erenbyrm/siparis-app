const externalMessages:Record<string,string>={
 'invalid login credentials':'E-posta veya şifre hatalı.',
 'email not confirmed':'E-posta adresi henüz doğrulanmamış.',
 'user already registered':'Bu e-posta zaten kayıtlı.',
 'email rate limit exceeded':'Çok fazla deneme yapıldı. Bir süre sonra tekrar deneyin.',
 'signups not allowed for this instance':'Yeni hesap oluşturma kapalı.'
};

export function message(error:unknown){
 const raw=error instanceof Error?error.message:'İşlem tamamlanamadı.';
 const key=raw.trim().replace(/[.!]+$/,'').toLocaleLowerCase('en-US');
 if(key.startsWith('for security purposes, you can only request this after '))return 'Güvenlik için kısa bir süre sonra tekrar deneyin.';
 return externalMessages[key]??raw;
}
