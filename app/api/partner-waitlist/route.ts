import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sgMail from '@sendgrid/mail';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const entry = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      city: formData.get('city')?.toString() || '',
      pos: formData.get('pos')?.toString() || '',
      timestamp: new Date().toISOString(),
    };

    const photo = formData.get('photo') as File | null;
    const pricing = formData.get('pricing') as File | null;

    if (!photo || !photo.size || !photo.type.startsWith('image/')) {
      return NextResponse.json(
        { ok: false, error: 'A valid image is required.' },
        { status: 400 }
      );
    }
    if (!pricing || !pricing.size || !/\.ya?ml$/i.test(pricing.name)) {
      return NextResponse.json(
        { ok: false, error: 'A valid pricing YAML file is required.' },
        { status: 400 }
      );
    }

    const s3 = new S3Client({ region: process.env.AWS_REGION });
    const bucket = process.env.AWS_S3_BUCKET as string;
    const timestamp = Date.now();

    const photoKey = `waitlist/photos/${timestamp}-${photo.name}`;
    const pricingKey = `waitlist/pricing/${timestamp}-${pricing.name}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: photoKey,
        Body: Buffer.from(await photo.arrayBuffer()),
        ContentType: photo.type,
      })
    );

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: pricingKey,
        Body: Buffer.from(await pricing.arrayBuffer()),
        ContentType: 'text/yaml',
      })
    );

    const logPath = path.join(process.cwd(), 'PartnerSignal_Log.yaml');
    let existing: any[] = [];
    if (fs.existsSync(logPath)) {
      const current = fs.readFileSync(logPath, 'utf8');
      existing = (yaml.load(current) as any[]) || [];
    }
    existing.push(entry);
    fs.writeFileSync(logPath, yaml.dump(existing));

    const config = {
      name: entry.name,
      city: entry.city,
      pos: entry.pos,
    };
    const configPath = path.join(
      process.cwd(),
      'public',
      'qr_hookahplus_config.yaml'
    );
    fs.writeFileSync(configPath, yaml.dump(config));

    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
    await sgMail.send({
      to: entry.email,
      from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@example.com',
      subject: 'HookahPlus Waitlist Confirmation',
      text: `Thanks for joining the HookahPlus waitlist, ${entry.name}!`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
